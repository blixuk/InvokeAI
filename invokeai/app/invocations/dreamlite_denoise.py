import torch
from typing import Optional

from invokeai.app.invocations.baseinvocation import BaseInvocation, Classification, invocation
from invokeai.app.invocations.fields import FieldDescriptions, Input, InputField, WithBoard, WithMetadata
from invokeai.app.invocations.model import ModelIdentifierField
from invokeai.app.invocations.primitives import ImageOutput
from invokeai.app.services.shared.invocation_context import InvocationContext
from invokeai.backend.util.devices import TorchDevice


@invocation(
    "dreamlite_image_generation",
    title="DreamLite Image Generation",
    tags=["image", "dreamlite", "generation"],
    category="generation",
    version="1.0.0",
    classification=Classification.Prototype,
)
class DreamLiteImageGenerationInvocation(BaseInvocation, WithMetadata, WithBoard):
    """Run text-to-image generation with DreamLite using Diffusers pipeline."""

    prompt: str = InputField(description="The prompt to generate", input=Input.Connection)
    model: ModelIdentifierField = InputField(description="The DreamLite model to use", input=Input.Connection)
    base_model: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="The DreamLite base model to use for Text Encoder/VAE (required if 'model' is a GGUF UNet)",
        input=Input.Connection,
    )
    num_inference_steps: int = InputField(default=25, description="Number of inference steps")
    guidance_scale: float = InputField(default=3.5, description="Guidance Scale / CFG")
    width: int = InputField(default=1024, description="Width of the generated image")
    height: int = InputField(default=1024, description="Height of the generated image")
    seed: int = InputField(default=0, description="Randomness seed")

    @torch.no_grad()
    def invoke(self, context: InvocationContext) -> ImageOutput:
        model_obj = context.models.load(self.model).model
        
        from diffusers.pipelines.dreamlite.pipeline_dreamlite import DreamLitePipeline
        from diffusers.models.unets.unet_dreamlite import DreamLiteUNetModel
        
        if isinstance(model_obj, dict):
            if not self.base_model:
                raise ValueError("A base_model must be provided when using a GGUF UNet model.")
            pipeline = context.models.load(self.base_model).model
            if not isinstance(pipeline, DreamLitePipeline):
                raise TypeError(f"base_model must be a DreamLitePipeline, got {type(pipeline).__name__}")
            pipeline.unet.load_state_dict(model_obj, assign=True)
        else:
            pipeline = model_obj
        
        device = TorchDevice.choose_torch_device()
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
