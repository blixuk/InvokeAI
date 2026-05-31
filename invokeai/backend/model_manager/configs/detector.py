from typing import Literal, Self, Any
from pydantic import Field
from invokeai.backend.model_manager.configs.base import Config_Base
from invokeai.backend.model_manager.configs.identification_utils import (
    raise_for_override_fields,
    raise_if_not_file,
    NotAMatchError,
)
from invokeai.backend.model_manager.model_on_disk import ModelOnDisk
from invokeai.backend.model_manager.taxonomy import (
    BaseModelType,
    ModelFormat,
    ModelType,
)

class Detector_Checkpoint_Config(Config_Base):
    """Model config for Detailer Detection models in Checkpoint format."""

    base: Literal[BaseModelType.Any] = Field(default=BaseModelType.Any)
    type: Literal[ModelType.Detector] = Field(default=ModelType.Detector)
    format: Literal[ModelFormat.Checkpoint] = Field(default=ModelFormat.Checkpoint)

    @classmethod
    def from_model_on_disk(cls, mod: ModelOnDisk, override_fields: dict[str, Any]) -> Self:
        raise_if_not_file(mod)
        raise_for_override_fields(cls, override_fields)

        path_lower = mod.path.name.lower()
        is_detector = (
            "yolo" in path_lower
            or "detector" in path_lower
            or "face" in path_lower
            or "hand" in path_lower
            or "person" in path_lower
            or "seg" in path_lower
            or "sam_" in path_lower
            or override_fields.get("type") == ModelType.Detector
        )

        if not is_detector:
            raise NotAMatchError("model does not match detector heuristics")

        if mod.path.suffix.lower() == ".onnx":
            raise NotAMatchError("model is ONNX, not checkpoint")

        override_fields["format"] = ModelFormat.Checkpoint
        return cls(**override_fields)


class Detector_ONNX_Config(Config_Base):
    """Model config for Detailer Detection models in ONNX format."""

    base: Literal[BaseModelType.Any] = Field(default=BaseModelType.Any)
    type: Literal[ModelType.Detector] = Field(default=ModelType.Detector)
    format: Literal[ModelFormat.ONNX] = Field(default=ModelFormat.ONNX)

    @classmethod
    def from_model_on_disk(cls, mod: ModelOnDisk, override_fields: dict[str, Any]) -> Self:
        raise_if_not_file(mod)
        raise_for_override_fields(cls, override_fields)

        path_lower = mod.path.name.lower()
        is_detector = (
            "yolo" in path_lower
            or "detector" in path_lower
            or "face" in path_lower
            or "hand" in path_lower
            or "person" in path_lower
            or "seg" in path_lower
            or "sam_" in path_lower
            or override_fields.get("type") == ModelType.Detector
        )

        if not is_detector:
            raise NotAMatchError("model does not match detector heuristics")

        if mod.path.suffix.lower() != ".onnx":
            raise NotAMatchError("model is not ONNX")

        override_fields["format"] = ModelFormat.ONNX
        return cls(**override_fields)
