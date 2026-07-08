# Copyright (c) 2026, the InvokeAI Development Team
"""Class for Krea2 model loading in InvokeAI."""

from pathlib import Path
from typing import Optional
import torch


from invokeai.backend.model_manager.configs.base import Checkpoint_Config_Base
from invokeai.backend.model_manager.configs.factory import AnyModelConfig
from invokeai.backend.model_manager.configs.main import (
    Main_Checkpoint_Krea2_Config,
    Main_Checkpoint_Krea2_GGUF_Config,
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


@ModelLoaderRegistry.register(base=BaseModelType.Krea2, type=ModelType.Main, format=ModelFormat.GGUFQuantized)
@ModelLoaderRegistry.register(base=BaseModelType.Krea2, type=ModelType.Main, format=ModelFormat.Checkpoint)
class Krea2CheckpointModel(ModelLoader):
    """Class to load Krea2 models from single-file checkpoints using diffusers native integration."""

    def _load_model(
        self,
        config: AnyModelConfig,
        submodel_type: Optional[SubModelType] = None,
    ) -> AnyModel:
        if not isinstance(config, (Main_Checkpoint_Krea2_Config, Main_Checkpoint_Krea2_GGUF_Config)):
            raise TypeError(
                f"Expected Main_Checkpoint_Krea2_Config or Main_Checkpoint_Krea2_GGUF_Config, got {type(config).__name__}. "
                "Model configuration type mismatch."
            )
            
        model_path = Path(config.path)
        
        if submodel_type is not None:
            raise NotImplementedError("Submodel loading for Krea2 is not yet supported.")

        dtype = self._torch_dtype
        
        import transformers
        if not hasattr(transformers, "Qwen3VLModel"):
            class MockQwen3:
                pass
            transformers.Qwen3VLModel = MockQwen3
            
        try:
            from diffusers.pipelines.krea2.pipeline_krea2 import Krea2Pipeline
        except ImportError as e:
            raise RuntimeError(f"Krea2Pipeline could not be imported: {e}")
        
        # Load the pipeline from single file natively using diffusers
        pipeline = Krea2Pipeline.from_single_file(
            model_path.as_posix(),
            torch_dtype=dtype,
        )
        
        pipeline = self._apply_fp8_layerwise_casting(pipeline, config, submodel_type)
        return pipeline
