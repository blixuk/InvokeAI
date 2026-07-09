import torch
from typing import Optional

from invokeai.app.invocations.baseinvocation import BaseInvocation, Classification, invocation
from invokeai.app.invocations.fields import FieldDescriptions, Input, InputField, WithBoard, WithMetadata
from invokeai.app.invocations.model import ModelIdentifierField
from invokeai.app.invocations.primitives import ImageOutput
from invokeai.app.services.shared.invocation_context import InvocationContext
from invokeai.backend.util.devices import TorchDevice


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
        description="The Krea 2 Checkpoint base model to use (Optional)",
        input=Input.Connection,
    )
    text_encoder: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="The Text Encoder (Qwen3VL) to use (required if base_model is missing)",
        input=Input.Connection,
    )
    vae: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="The VAE (QwenImage) to use (required if base_model is missing)",
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
        
        if isinstance(model_obj, dict):
            base_model_id = self.base_model
            pipeline = None
            if base_model_id:
                pipeline = context.models.load(base_model_id).model
                if not isinstance(pipeline, Krea2Pipeline):
                    raise TypeError(f"base_model must be a Krea2Pipeline, got {type(pipeline).__name__}")
            else:
                te_id = self.text_encoder
                vae_id = self.vae
                from invokeai.backend.model_manager.taxonomy import ModelType
                
                if not te_id:
                    te_models = context.services.model_manager.store.search_by_attr(model_type=ModelType.Qwen3Encoder)
                    if not te_models:
                        raise ValueError("No Krea 2 Text Encoder found. Please install one or wire it explicitly.")
                    te_id = ModelIdentifierField(key=te_models[0].key, hash=te_models[0].hash, name=te_models[0].name, base=te_models[0].base, type=te_models[0].type)
                    
                if not vae_id:
                    vae_models = context.services.model_manager.store.search_by_attr(model_type=ModelType.VAE)
                    vae_models = [m for m in vae_models if "qwen" in m.name.lower() or "krea" in m.name.lower()]
                    if not vae_models:
                        raise ValueError("No Krea 2 VAE found. Please install one or wire it explicitly.")
                    vae_id = ModelIdentifierField(key=vae_models[0].key, hash=vae_models[0].hash, name=vae_models[0].name, base=vae_models[0].base, type=vae_models[0].type)
                
                te_model = context.models.load(te_id).model
                vae_model = context.models.load(vae_id).model
                
                from diffusers import FlowMatchEulerDiscreteScheduler
                from transformers import AutoTokenizer
                
                scheduler = FlowMatchEulerDiscreteScheduler(use_dynamic_shifting=True, base_shift=0.5, max_shift=1.15, base_image_seq_len=256, max_image_seq_len=6400)
                tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-VL-3B-Instruct")
                transformer = Krea2Transformer2DModel()
                
                pipeline = Krea2Pipeline(
                    scheduler=scheduler,
                    vae=vae_model,
                    text_encoder=te_model,
                    tokenizer=tokenizer,
                    transformer=transformer,
                )

            pipeline.transformer.load_state_dict(model_obj, assign=True)
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
