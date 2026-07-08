import torch
from typing import Optional

from invokeai.app.invocations.baseinvocation import BaseInvocation, Classification, invocation
from invokeai.app.invocations.fields import FieldDescriptions, Input, InputField, WithBoard, WithMetadata
from invokeai.app.invocations.model import ModelIdentifierField
from invokeai.app.invocations.primitives import ImageOutput
from invokeai.app.services.shared.invocation_context import InvocationContext


@invocation(
    "krea2_image_generation",
    title="Krea 2 Image Generation",
    tags=["image", "krea2", "generation"],
    category="generation",
    version="1.0.0",
    classification=Classification.Prototype,
)
class Krea2ImageGenerationInvocation(BaseInvocation, WithMetadata, WithBoard):
    """Run text-to-image generation with Krea 2 using Diffusers pipeline."""

    prompt: str = InputField(description="The prompt to generate", input=Input.Connection)
    model: ModelIdentifierField = InputField(description="The Krea 2 model to use", input=Input.Connection)
    base_model: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="The Krea 2 base model to use for Text Encoder/VAE (required if 'model' is a GGUF UNet)",
        input=Input.Connection,
    )
    num_inference_steps: int = InputField(default=10, description="Number of inference steps")
    guidance_scale: float = InputField(default=1.5, description="Guidance Scale / CFG")
    width: int = InputField(default=1024, description="Width of the generated image")
    height: int = InputField(default=1024, description="Height of the generated image")
    seed: int = InputField(default=0, description="Randomness seed")

    @torch.no_grad()
    def invoke(self, context: InvocationContext) -> ImageOutput:
        model_obj = context.models.load(self.model).model
        
        from diffusers.pipelines.krea2.pipeline_krea2 import Krea2Pipeline
        from diffusers.models.transformers.transformer_krea2 import Krea2Transformer2DModel
        
        if isinstance(model_obj, Krea2Transformer2DModel):
            if not self.base_model:
                raise ValueError("A base_model must be provided when using a GGUF UNet model.")
            pipeline = context.models.load(self.base_model).model
            if not isinstance(pipeline, Krea2Pipeline):
                raise TypeError(f"base_model must be a Krea2Pipeline, got {type(pipeline).__name__}")
            pipeline.transformer = model_obj
        else:
            pipeline = model_obj
        
        device = context.util.get_device()
        pipeline.to(device)

        generator = torch.Generator(device="cpu").manual_seed(self.seed)
        
        result = pipeline(
            prompt=self.prompt,
            num_inference_steps=self.num_inference_steps,
            guidance_scale=self.guidance_scale,
            width=self.width,
            height=self.height,
            generator=generator,
        )
        
        image = result.images[0]
        image_dto = context.images.save(image=image)
        return ImageOutput.build(image_dto)
