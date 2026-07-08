# Copyright (c) 2026, the InvokeAI Development Team
"""Class for DreamLite model loading in InvokeAI."""

from pathlib import Path
from typing import Optional
import torch


from invokeai.backend.model_manager.configs.base import Checkpoint_Config_Base
from invokeai.backend.model_manager.configs.factory import AnyModelConfig
from invokeai.backend.model_manager.configs.main import (
    Main_Checkpoint_DreamLite_Config,
    Main_Checkpoint_DreamLite_GGUF_Config,
)
from invokeai.backend.model_manager.load.load_default import ModelLoader
from invokeai.backend.model_manager.load.model_loader_registry import ModelLoaderRegistry
from invokeai.backend.model_manager.taxonomy import (
    AnyModel,
    BaseModelType,
    ModelFormat,
    ModelType,
    SubModelType,
)


@ModelLoaderRegistry.register(base=BaseModelType.DreamLite, type=ModelType.Main, format=ModelFormat.GGUFQuantized)
@ModelLoaderRegistry.register(base=BaseModelType.DreamLite, type=ModelType.Main, format=ModelFormat.Checkpoint)
class DreamLiteCheckpointModel(ModelLoader):
    """Class to load DreamLite models from single-file checkpoints using diffusers native integration."""

    def _load_model(
        self,
        config: AnyModelConfig,
        submodel_type: Optional[SubModelType] = None,
    ) -> AnyModel:
        if not isinstance(config, (Main_Checkpoint_DreamLite_Config, Main_Checkpoint_DreamLite_GGUF_Config)):
            raise TypeError(
                f"Expected Main_Checkpoint_DreamLite_Config or Main_Checkpoint_DreamLite_GGUF_Config, got {type(config).__name__}. "
                "Model configuration type mismatch."
            )
            
        model_path = Path(config.path)
        
        if submodel_type is not None:
            raise NotImplementedError("Submodel loading for DreamLite is not yet supported.")

        dtype = self._torch_dtype
        
        import transformers
        if not hasattr(transformers, "Qwen3VLForConditionalGeneration"):
            class MockQwen3:
                pass
            transformers.Qwen3VLForConditionalGeneration = MockQwen3
            transformers.Qwen3VLProcessor = MockQwen3
            
        try:
            from diffusers.pipelines.dreamlite.pipeline_dreamlite import DreamLitePipeline
        except ImportError as e:
            raise RuntimeError(f"DreamLitePipeline could not be imported: {e}")
            
        if model_path.suffix == ".gguf":
            from invokeai.backend.quantization.gguf.loaders import gguf_sd_loader
            sd = gguf_sd_loader(model_path, compute_dtype=dtype)
            return sd
        
        # Load the pipeline from single file natively using diffusers (for Safetensors)
        pipeline = DreamLitePipeline.from_single_file(
            model_path.as_posix(),
            torch_dtype=dtype,
        )
        
        pipeline = self._apply_fp8_layerwise_casting(pipeline, config, submodel_type)
        return pipeline
