"""Flux2 Klein Denoising Function.

This module provides the denoising function for FLUX.2 Klein models,
which use Qwen3 as the text encoder instead of CLIP+T5.
"""

from contextlib import contextmanager
import inspect
import math
from typing import Any, Callable

import numpy as np
import torch
from tqdm import tqdm

import diffusers.models.embeddings as diffusers_embeddings
from invokeai.backend.rectified_flow.rectified_flow_inpaint_extension import RectifiedFlowInpaintExtension
from invokeai.backend.stable_diffusion.diffusers_pipeline import PipelineIntermediateState
from invokeai.backend.util.logging import InvokeAILogger

logger = InvokeAILogger.get_logger(__name__)


def compute_sega_rope_scales(
    img: torch.Tensor,
    original_seq_len: int,
    packed_h: int,
    packed_w: int,
    num_rope_dims: int,
    alpha_base: float = 1.0,
) -> torch.Tensor:
    """Computes dynamic RoPE frequency scales based on 2D FFT spectral energy."""
    # Slice off reference images
    x = img[:, :original_seq_len, :]
    B, SeqLen, C = x.shape
    
    # Reshape back to spatial grid
    x_grid = x.transpose(1, 2).reshape(B, C, packed_h, packed_w)
    
    # Compute 2D FFT
    fft_repr = torch.fft.rfft2(x_grid.float(), dim=(-2, -1))
    spectral_energy = torch.abs(fft_repr) ** 2
    
    # Average across channels and batch
    mean_energy = spectral_energy.mean(dim=(0, 1))
    
    # Compute 1D energy profiles for H and W
    energy_h = mean_energy.mean(dim=1)
    energy_w = mean_energy.mean(dim=0)
    
    # Interpolate to 28 unique frequencies (for 56 dimensions)
    energy_h_resized = torch.nn.functional.interpolate(
        energy_h.view(1, 1, -1),
        size=28,
        mode="linear",
        align_corners=False
    ).view(-1)
    
    energy_w_resized = torch.nn.functional.interpolate(
        energy_w.view(1, 1, -1),
        size=28,
        mode="linear",
        align_corners=False
    ).view(-1)
    
    # Compute dynamic scales
    scale_h_uniq = alpha_base / (1.0 + torch.log1p(energy_h_resized))
    scale_w_uniq = alpha_base / (1.0 + torch.log1p(energy_w_resized))
    
    # Repeat for conjugate dimensions
    scale_h = torch.repeat_interleave(scale_h_uniq, 2)
    scale_w = torch.repeat_interleave(scale_w_uniq, 2)
    
    # Combine (T, H, W)
    scale_t = torch.ones(16, device=img.device, dtype=img.dtype)
    scales = torch.cat([scale_t, scale_h.to(img.device, img.dtype), scale_w.to(img.device, img.dtype)])
    
    return scales


@contextmanager
def patch_rope_for_sega(img: torch.Tensor, original_seq_len: int, img_ids: torch.Tensor, sega_enabled: bool = False):
    if not sega_enabled:
        yield
        return
        
    orig_apply_rotary_emb = diffusers_embeddings.apply_rotary_emb
    
    # Precompute packed height and width from img_ids
    # img_ids coordinates: 1 corresponds to H, 2 corresponds to W
    packed_h = int(img_ids[..., 1].max().item() + 1)
    packed_w = int(img_ids[..., 2].max().item() + 1)
    
    # Precompute scales once per denoising step for efficiency and logging
    scales = compute_sega_rope_scales(
        img=img,
        original_seq_len=original_seq_len,
        packed_h=packed_h,
        packed_w=packed_w,
        num_rope_dims=128,
    )
    
    logger.info(
        f"SEGA (Spectral-Energy Guided Attention) active | Grid: {packed_h}x{packed_w} | "
        f"RoPE Scale Range: {scales.min().item():.4f} - {scales.max().item():.4f}"
    )
    
    def sega_apply_rotary_emb(x, freqs_cis, **kwargs):
        # freqs_cis is a tuple of (cos, sin)
        cos, sin = freqs_cis
        
        # Scale positional coordinate frequencies using precomputed scales
        cos_scaled = cos * scales.view(1, -1)
        sin_scaled = sin * scales.view(1, -1)
        
        return orig_apply_rotary_emb(x, (cos_scaled, sin_scaled), **kwargs)
        
    diffusers_embeddings.apply_rotary_emb = sega_apply_rotary_emb
    try:
        yield
    finally:
        diffusers_embeddings.apply_rotary_emb = orig_apply_rotary_emb


def denoise(
    model: torch.nn.Module,
    # model input
    img: torch.Tensor,
    img_ids: torch.Tensor,
    txt: torch.Tensor,
    txt_ids: torch.Tensor,
    # sampling parameters
    timesteps: list[float],
    step_callback: Callable[[PipelineIntermediateState], None],
    guidance: float,
    cfg_scale: list[float],
    # Negative conditioning for CFG
    neg_txt: torch.Tensor | None = None,
    neg_txt_ids: torch.Tensor | None = None,
    # Scheduler for stepping (e.g., FlowMatchEulerDiscreteScheduler, FlowMatchHeunDiscreteScheduler)
    scheduler: Any = None,
    # Dynamic shifting parameter for FLUX.2 Klein (computed from image resolution)
    mu: float | None = None,
    # Inpainting extension for merging latents during denoising
    inpaint_extension: RectifiedFlowInpaintExtension | None = None,
    # Reference image conditioning (multi-reference image editing)
    img_cond_seq: torch.Tensor | None = None,
    img_cond_seq_ids: torch.Tensor | None = None,
    # SEGA resolution extrapolation
    sega_enabled: bool = False,
) -> torch.Tensor:
    """Denoise latents using a FLUX.2 Klein transformer model.

    This is a simplified denoise function for FLUX.2 Klein models that uses
    the diffusers Flux2Transformer2DModel interface.

    All current FLUX.2 Klein variants (4B, 4B Base, 9B, 9B Base) have guidance_embeds=False
    in their HF transformer config (or absent/zeroed projection weights), so the guidance
    value is passed but effectively ignored by the model. The argument is retained for
    node-graph compatibility and future variants that may ship trained guidance projections.
    CFG is applied externally using negative conditioning when cfg_scale != 1.0.

    Args:
        model: The Flux2Transformer2DModel from diffusers.
        img: Packed latent image tensor of shape (B, seq_len, channels).
        img_ids: Image position IDs tensor.
        txt: Text encoder hidden states (Qwen3 embeddings).
        txt_ids: Text position IDs tensor.
        timesteps: List of timesteps for denoising schedule (linear sigmas from 1.0 to 1/n).
        step_callback: Callback function for progress updates.
        guidance: Guidance strength. Inert for all current FLUX.2 Klein variants
            (their guidance_embeds projection weights are absent/zero).
        cfg_scale: List of CFG scale values per step.
        neg_txt: Negative text embeddings for CFG (optional).
        neg_txt_ids: Negative text position IDs (optional).
        scheduler: Optional diffusers scheduler (Euler, Heun, LCM). If None, uses manual Euler.
        mu: Dynamic shifting parameter computed from image resolution. Required when scheduler
            has use_dynamic_shifting=True.
        sega_enabled: If True, uses Spectral-Energy Guided Attention for resolution extrapolation.

    Returns:
        Denoised latent tensor.
    """
    total_steps = len(timesteps) - 1

    # Store original sequence length for extracting output later (before concatenating reference images)
    original_seq_len = img.shape[1]

    # Concatenate reference image conditioning if provided (multi-reference image editing)
    if img_cond_seq is not None and img_cond_seq_ids is not None:
        img = torch.cat([img, img_cond_seq], dim=1)
        img_ids = torch.cat([img_ids, img_cond_seq_ids], dim=1)

    # The transformer forward() requires a guidance tensor even when guidance_embeds=False,
    # because the Flux2TimestepGuidanceEmbeddings forward signature takes it unconditionally.
    # All current Klein variants have guidance_embeds=False, so the value is ignored internally.
    guidance_vec = torch.full((img.shape[0],), guidance, device=img.device, dtype=img.dtype)

    # Use scheduler if provided
    use_scheduler = scheduler is not None
    if use_scheduler:
        # Set up scheduler with sigmas and mu for dynamic shifting
        # Convert timesteps (0-1 range) to sigmas for the scheduler
        # The scheduler will apply dynamic shifting internally using mu (if enabled in scheduler config)
        sigmas = np.array(timesteps[:-1], dtype=np.float32)  # Exclude final 0.0

        # Check if scheduler supports sigmas parameter using inspect.signature
        # FlowMatchHeunDiscreteScheduler and FlowMatchLCMScheduler don't support sigmas
        set_timesteps_sig = inspect.signature(scheduler.set_timesteps)
        supports_sigmas = "sigmas" in set_timesteps_sig.parameters
        if supports_sigmas and mu is not None:
            # Pass mu if provided - it will only be used if scheduler has use_dynamic_shifting=True
            scheduler.set_timesteps(sigmas=sigmas.tolist(), mu=mu, device=img.device)
        elif supports_sigmas:
            scheduler.set_timesteps(sigmas=sigmas.tolist(), device=img.device)
        else:
            # Scheduler doesn't support sigmas (e.g., Heun, LCM) - use num_inference_steps
            #
            # Important for img2img callers: if the initial latent/noise blend was
            # computed from a separate pre-scheduler schedule, that preblend may not
            # match this scheduler's true first step exactly.
            scheduler_kwargs: dict[str, Any] = {"num_inference_steps": len(sigmas), "device": img.device}
            if mu is not None and "mu" in set_timesteps_sig.parameters:
                scheduler_kwargs["mu"] = mu
            scheduler.set_timesteps(**scheduler_kwargs)
        num_scheduler_steps = len(scheduler.timesteps)
        is_heun = hasattr(scheduler, "state_in_first_order")
        user_step = 0

        pbar = tqdm(total=total_steps, desc="Denoising")
        for step_index in range(num_scheduler_steps):
            timestep = scheduler.timesteps[step_index]
            # Convert scheduler timestep (0-1000) to normalized (0-1) for the model
            t_curr = timestep.item() / scheduler.config.num_train_timesteps
            t_vec = torch.full((img.shape[0],), t_curr, dtype=img.dtype, device=img.device)

            # Track if we're in first or second order step (for Heun)
            in_first_order = scheduler.state_in_first_order if is_heun else True

            # Run the transformer model (matching diffusers: guidance=guidance, return_dict=False)
            with patch_rope_for_sega(img, original_seq_len, img_ids, sega_enabled=sega_enabled):
                output = model(
                    hidden_states=img,
                    encoder_hidden_states=txt,
                    timestep=t_vec,
                    img_ids=img_ids,
                    txt_ids=txt_ids,
                    guidance=guidance_vec,
                    return_dict=False,
                )

                # Extract the sample from the output (return_dict=False returns tuple)
                pred = output[0] if isinstance(output, tuple) else output

                step_cfg_scale = cfg_scale[min(user_step, len(cfg_scale) - 1)]

                # Apply CFG if scale is not 1.0
                if not math.isclose(step_cfg_scale, 1.0):
                    if neg_txt is None:
                        raise ValueError("Negative text conditioning is required when cfg_scale is not 1.0.")

                    neg_output = model(
                        hidden_states=img,
                        encoder_hidden_states=neg_txt,
                        timestep=t_vec,
                        img_ids=img_ids,
                        txt_ids=neg_txt_ids if neg_txt_ids is not None else txt_ids,
                        guidance=guidance_vec,
                        return_dict=False,
                    )

                    neg_pred = neg_output[0] if isinstance(neg_output, tuple) else neg_output
                    pred = neg_pred + step_cfg_scale * (pred - neg_pred)

            # Use scheduler.step() for the update
            step_output = scheduler.step(model_output=pred, timestep=timestep, sample=img)
            img = step_output.prev_sample

            # Get t_prev for inpainting (next sigma value)
            if step_index + 1 < len(scheduler.sigmas):
                t_prev = scheduler.sigmas[step_index + 1].item()
            else:
                t_prev = 0.0

            # Apply inpainting merge at each step
            if inpaint_extension is not None:
                # Separate the generated latents from the reference conditioning
                gen_img = img[:, :original_seq_len, :]
                ref_img = img[:, original_seq_len:, :]

                # Merge only the generated part
                gen_img = inpaint_extension.merge_intermediate_latents_with_init_latents(gen_img, t_prev)

                # Concatenate back together
                img = torch.cat([gen_img, ref_img], dim=1)

            # For Heun, only increment user step after second-order step completes
            if is_heun:
                if not in_first_order:
                    user_step += 1
                    if user_step <= total_steps:
                        pbar.update(1)
                        preview_img = img - t_curr * pred
                        if inpaint_extension is not None:
                            preview_img = inpaint_extension.merge_intermediate_latents_with_init_latents(
                                preview_img, 0.0
                            )
                        step_callback(
                            PipelineIntermediateState(
                                step=user_step,
                                order=2,
                                total_steps=total_steps,
                                timestep=int(t_curr * 1000),
                                latents=preview_img,
                            ),
                        )
            else:
                user_step += 1
                if user_step <= total_steps:
                    pbar.update(1)
                    preview_img = img - t_curr * pred
                    if inpaint_extension is not None:
                        preview_img = inpaint_extension.merge_intermediate_latents_with_init_latents(preview_img, 0.0)
                    # Extract only the generated image portion for preview (exclude reference images)
                    callback_latents = preview_img[:, :original_seq_len, :] if img_cond_seq is not None else preview_img
                    step_callback(
                        PipelineIntermediateState(
                            step=user_step,
                            order=1,
                            total_steps=total_steps,
                            timestep=int(t_curr * 1000),
                            latents=callback_latents,
                        ),
                    )

        pbar.close()
    else:
        # Manual Euler stepping (original behavior)
        for step_index, (t_curr, t_prev) in tqdm(list(enumerate(zip(timesteps[:-1], timesteps[1:], strict=True)))):
            t_vec = torch.full((img.shape[0],), t_curr, dtype=img.dtype, device=img.device)

            # Run the transformer model (matching diffusers: guidance=guidance, return_dict=False)
            with patch_rope_for_sega(img, original_seq_len, img_ids, sega_enabled=sega_enabled):
                output = model(
                    hidden_states=img,
                    encoder_hidden_states=txt,
                    timestep=t_vec,
                    img_ids=img_ids,
                    txt_ids=txt_ids,
                    guidance=guidance_vec,
                    return_dict=False,
                )

                # Extract the sample from the output (return_dict=False returns tuple)
                pred = output[0] if isinstance(output, tuple) else output

                step_cfg_scale = cfg_scale[step_index]

                # Apply CFG if scale is not 1.0
                if not math.isclose(step_cfg_scale, 1.0):
                    if neg_txt is None:
                        raise ValueError("Negative text conditioning is required when cfg_scale is not 1.0.")

                    neg_output = model(
                        hidden_states=img,
                        encoder_hidden_states=neg_txt,
                        timestep=t_vec,
                        img_ids=img_ids,
                        txt_ids=neg_txt_ids if neg_txt_ids is not None else txt_ids,
                        guidance=guidance_vec,
                        return_dict=False,
                    )

                    neg_pred = neg_output[0] if isinstance(neg_output, tuple) else neg_output
                    pred = neg_pred + step_cfg_scale * (pred - neg_pred)

            # Euler step
            preview_img = img - t_curr * pred
            img = img + (t_prev - t_curr) * pred

            # Apply inpainting merge at each step
            if inpaint_extension is not None:
                # Separate the generated latents from the reference conditioning
                gen_img = img[:, :original_seq_len, :]
                ref_img = img[:, original_seq_len:, :]

                # Merge only the generated part
                gen_img = inpaint_extension.merge_intermediate_latents_with_init_latents(gen_img, t_prev)

                # Concatenate back together
                img = torch.cat([gen_img, ref_img], dim=1)

                # Handling preview images
                preview_gen = preview_img[:, :original_seq_len, :]
                preview_gen = inpaint_extension.merge_intermediate_latents_with_init_latents(preview_gen, 0.0)

            # Extract only the generated image portion for preview (exclude reference images)
            callback_latents = preview_img[:, :original_seq_len, :] if img_cond_seq is not None else preview_img
            step_callback(
                PipelineIntermediateState(
                    step=step_index + 1,
                    order=1,
                    total_steps=total_steps,
                    timestep=int(t_curr),
                    latents=callback_latents,
                ),
            )

    # Extract only the generated image portion (exclude concatenated reference images)
    if img_cond_seq is not None:
        img = img[:, :original_seq_len, :]

    return img

