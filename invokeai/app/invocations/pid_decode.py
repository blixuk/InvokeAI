"""Pixel Diffusion Decoder (PiD) Invocation.

Formulates VAE latent decoding as a conditional pixel-space diffusion refinement
process to reconstruct extremely sharp, high-fidelity 2K/4K outputs in 4 steps
using the official nv-tlabs/PiD distilled checkpoints.
"""

import os
import sys
import torch
from PIL import Image
from pydantic import ConfigDict
from typing import Literal

from invokeai.app.invocations.baseinvocation import BaseInvocation, Classification, invocation
from invokeai.app.invocations.fields import FieldDescriptions, Input, InputField, LatentsField, WithBoard, WithMetadata
from invokeai.app.invocations.model import VAEField
from invokeai.app.invocations.primitives import ImageOutput
from invokeai.app.services.shared.invocation_context import InvocationContext
from invokeai.backend.model_manager.load.load_base import LoadedModel
from invokeai.backend.util.devices import TorchDevice

# Module-level model cache to prevent reloading the heavy 5GB weights on every generation
_PID_MODEL_CACHE = {}


@invocation(
    "pid_decode",
    title="Pixel Diffusion Decoder (PiD)",
    tags=["latents", "image", "vae", "pid", "decode", "sharpness"],
    category="latents",
    version="1.0.0",
    classification=Classification.Prototype,
)
class PiDDecodeInvocation(BaseInvocation, WithMetadata, WithBoard):
    """Decodes latents to images using a 4-step conditional Pixel Diffusion process (NVIDIA PiD).
    This achieves extremely sharp, high-fidelity details that are typically lost in standard VAE decoding.
    """

    latents: LatentsField = InputField(
        description=FieldDescriptions.latents,
        input=Input.Connection,
    )
    vae: VAEField = InputField(
        description=FieldDescriptions.vae,
        input=Input.Connection,
    )
    model_variant: Literal["2k", "4k"] = InputField(
        default="2k",
        description="Which NVIDIA PiD distilled model checkpoint to use: 2K (res2k_sr4x) or 4K (res2kto4k_sr4x).",
    )
    text_encoder: Literal["gemma-2-2b-it", "gemma-2-2b-it-abliterated"] = InputField(
        default="gemma-2-2b-it",
        description="Text encoder variant to use for prompt conditioning: standard Gemma 2 or abliterated uncensored Gemma 2.",
    )
    steps: int = InputField(
        default=4,
        ge=1,
        le=20,
        description="Number of conditional pixel-space diffusion denoising steps (1-20).",
    )
    scale: int = InputField(
        default=4,
        ge=1,
        le=8,
        description="Detail enhancement upscaling factor (default is 4x).",
    )

    model_config = ConfigDict(protected_namespaces=())

    def _pid_diffusion_decode(
        self,
        vae_info: LoadedModel,
        latents: torch.Tensor,
        model_variant: str,
        text_encoder: str,
        steps: int,
        scale: int,
        logger,
    ) -> Image.Image:
        """Decode latents to image using conditional Pixel Diffusion."""
        device = TorchDevice.choose_torch_device()

        # 1. Base VAE Decode to get the low-resolution pixel-space image (in [-1, 1] range)
        with vae_info.model_on_device() as (_, vae):
            vae_dtype = next(iter(vae.parameters())).dtype
            latents_device = latents.to(device=device, dtype=vae_dtype)

            # Enable tiling automatically if image is large to prevent OOM
            if latents.shape[-1] >= 256:
                vae.enable_tiling()

            with torch.inference_mode():
                decoded = vae.decode(latents_device, return_dict=False)[0]  # [1, 3, H, W] in [-1, 1]

        # Offload all unlocked InvokeAI models to CPU to ensure plenty of VRAM is available for PiD
        if hasattr(vae_info, "cache") and vae_info.cache is not None:
            logger.info("Offloading all unlocked InvokeAI models to CPU to free up VRAM...")
            try:
                # Request freeing 20 GB of VRAM
                vae_info.cache._offload_unlocked_models(20 * 1024 * 1024 * 1024)
            except Exception as e:
                logger.warning(f"Failed to offload unlocked models: {e}")
            TorchDevice.empty_cache()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        # 2. Load or retrieve the pre-trained PiD model
        global _PID_MODEL_CACHE
        cache_key = f"{model_variant}_{text_encoder}"
        if cache_key not in _PID_MODEL_CACHE:
            logger.info(f"Loading NVIDIA PiD '{model_variant}' model with text encoder '{text_encoder}' onto CUDA device...")
            
            # Set up checkpoints matching available models on disk
            if model_variant == "2k":
                experiment_name = "PiD_res2k_sr4x_official_flux2_distill_4step"
                checkpoint_path = "/mnt/workplace/ai/SD/models/PiD/PiD_res2k_sr4x_official_flux2_distill_4step/model_ema_bf16.pth"
            else:
                experiment_name = "PiD_res2kto4k_sr4x_official_flux2_distill_4step"
                checkpoint_path = "/mnt/workplace/ai/SD/models/PiD/PiD_res2kto4k_sr4x_official_flux2_distill_4step/model_ema_bf16.pth"

            proposal_dir = "/mnt/personal/programming/Python/2026/InvokeAI/proposals/PiD"
            if proposal_dir not in sys.path:
                sys.path.insert(0, proposal_dir)

            old_cwd = os.getcwd()
            try:
                os.chdir(proposal_dir)
                from pid._src.utils.model_loader import load_model_from_checkpoint
                pid_model, _ = load_model_from_checkpoint(
                    experiment_name=experiment_name,
                    checkpoint_path=checkpoint_path,
                    config_file="pid/_src/configs/pid/config.py",
                    experiment_opts=[f"model.config.text_encoder_name={text_encoder}"],
                )
                pid_model.eval()
                _PID_MODEL_CACHE[cache_key] = pid_model
            finally:
                os.chdir(old_cwd)

        pid_model = _PID_MODEL_CACHE[cache_key]

        # 3. Perform conditional Pixel Diffusion refinement
        with torch.no_grad():
            logger.info("Encoding low-resolution VAE latents using PiD tokenizer...")
            baseline_bf16 = decoded.to(dtype=torch.bfloat16, device="cuda")
            clean_latent = pid_model.encode_lq_latent(baseline_bf16)

            data_batch = {
                "caption": [""],
                "LQ_video_or_image": baseline_bf16,
                "LQ_latent": clean_latent,
                "degrade_sigma": torch.tensor([0.0], device="cuda", dtype=torch.float32),
            }

            lq_h, lq_w = decoded.shape[-2], decoded.shape[-1]
            infer_image_size = (lq_h * scale, lq_w * scale)

            logger.info(f"Running NVIDIA PiD Denoising Loop: steps={steps}, target_size={infer_image_size}...")
            with torch.inference_mode():
                samples = pid_model.generate_samples_from_batch(
                    data_batch,
                    cfg_scale=1.0,
                    num_steps=steps,
                    seed=42,
                    shift=None,
                    image_size=infer_image_size,
                )

            ours_img = samples[0].float().cpu().clamp(-1, 1)  # [3, 1, H_out, W_out]
            ours_img_3d = ours_img.squeeze(1)  # [3, H_out, W_out]

            # Convert from [-1, 1] range to [0, 255] PIL image
            img_np = (((ours_img_3d + 1.0) / 2.0).permute(1, 2, 0).numpy() * 255).astype("uint8")
            img_pil = Image.fromarray(img_np).convert("RGB")

        return img_pil

    @torch.no_grad()
    def invoke(self, context: InvocationContext) -> ImageOutput:
        latents = context.tensors.load(self.latents.latents_name)

        context.logger.info(
            f"Pixel Diffusion Decoder active | Inputs: shape={latents.shape} | Steps: {self.steps} | Variant: {self.model_variant} | Text Encoder: {self.text_encoder} | Scale: {self.scale}x"
        )

        vae_info = context.models.load(self.vae.vae)
        context.util.signal_progress("Running NVIDIA Pixel Diffusion Decoder")

        image = self._pid_diffusion_decode(
            vae_info=vae_info,
            latents=latents,
            model_variant=self.model_variant,
            text_encoder=self.text_encoder,
            steps=self.steps,
            scale=self.scale,
            logger=context.logger,
        )

        TorchDevice.empty_cache()
        image_dto = context.images.save(image=image)
        return ImageOutput.build(image_dto)
