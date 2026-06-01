import torch
from pydantic import field_validator

from invokeai.app.invocations.baseinvocation import BaseInvocation, BaseInvocationOutput, invocation, invocation_output
from invokeai.app.invocations.constants import LATENT_SCALE_FACTOR
from invokeai.app.invocations.fields import FieldDescriptions, InputField, LatentsField, OutputField
from invokeai.app.invocations.latent_noise import (
    LatentNoiseType,
    generate_noise_tensor,
)
from invokeai.app.services.shared.invocation_context import InvocationContext
from invokeai.app.util.misc import SEED_MAX
from invokeai.backend.util.devices import TorchDevice


@invocation_output("noise_output")
class NoiseOutput(BaseInvocationOutput):
    """Invocation noise output"""

    noise: LatentsField = OutputField(description=FieldDescriptions.noise)
    width: int = OutputField(description=FieldDescriptions.width)
    height: int = OutputField(description=FieldDescriptions.height)

    @classmethod
    def build(cls, latents_name: str, latents: torch.Tensor, seed: int) -> "NoiseOutput":
        return cls(
            noise=LatentsField(latents_name=latents_name, seed=seed),
            width=latents.shape[-1] * LATENT_SCALE_FACTOR,
            height=latents.shape[-2] * LATENT_SCALE_FACTOR,
        )


@invocation(
    "noise",
    title="Create Latent Noise",
    tags=["latents", "noise"],
    category="latents",
    version="1.2.0",
)
class NoiseInvocation(BaseInvocation):
    """Generates latent noise for supported denoiser architectures."""

    noise_type: LatentNoiseType = InputField(default="SD", description="Architecture-specific noise type.")

    seed: int = InputField(
        default=0,
        ge=0,
        le=SEED_MAX,
        description=FieldDescriptions.seed,
    )
    variation_seed: int = InputField(
        default=0,
        ge=0,
        le=SEED_MAX,
        description="Secondary seed for slerp-based noise variations (0 to disable variation).",
    )
    variation_strength: float = InputField(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Strength of the variation slerp interpolation (0.0 to 1.0).",
    )
    width: int = InputField(
        default=512,
        multiple_of=LATENT_SCALE_FACTOR,
        gt=0,
        description=FieldDescriptions.width,
    )
    height: int = InputField(
        default=512,
        multiple_of=LATENT_SCALE_FACTOR,
        gt=0,
        description=FieldDescriptions.height,
    )
    use_cpu: bool = InputField(
        default=True,
        description="Use CPU for noise generation (for reproducible results across platforms)",
    )

    @field_validator("seed", "variation_seed", mode="before")
    def modulo_seed(cls, v):
        """Return the seed modulo (SEED_MAX + 1) to ensure it is within the valid range."""
        return v % (SEED_MAX + 1)

    def invoke(self, context: InvocationContext) -> NoiseOutput:
        device = TorchDevice.choose_torch_device()
        noise = generate_noise_tensor(
            noise_type=self.noise_type,
            width=self.width,
            height=self.height,
            device=device,
            seed=self.seed,
            dtype=TorchDevice.choose_torch_dtype(),
            use_cpu=self.use_cpu,
        )

        if self.variation_strength > 0.0:
            from invokeai.app.invocations.blend_latents import slerp
            variation_noise = generate_noise_tensor(
                noise_type=self.noise_type,
                width=self.width,
                height=self.height,
                device=device,
                seed=self.variation_seed,
                dtype=TorchDevice.choose_torch_dtype(),
                use_cpu=self.use_cpu,
            )
            # Perform spherical linear interpolation
            noise = slerp(self.variation_strength, noise, variation_noise, device)
            # Ensure the slerp tensor goes back to CPU/correct format
            noise = noise.to("cpu")

        name = context.tensors.save(tensor=noise)
        return NoiseOutput.build(latents_name=name, latents=noise, seed=self.seed)
