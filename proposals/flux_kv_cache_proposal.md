# Proposal & Implementation Plan: FLUX KV-Cache Support with VRAM & Precision Toggles

This proposal outlines the design and integration path for adding key-value (KV) caching to the custom FLUX denoising pipeline in InvokeAI. It specifically details how to allow users to configure cache precision (FP16/BF16 vs. FP8) and cache storage device (GPU vs. CPU Offloading) to optimize performance and prevent Out-Of-Memory (OOM) issues on consumer hardware.

---

## 1. Architectural Motivation & Custom Implementation

InvokeAI generates images using custom block processors (`custom_block_processor.py`) to handle regional prompting, IP-Adapter integrations, DyPE, and ControlNet. Consequently, we cannot use standard `diffusers` pipelines directly. 

Our strategy is to design a stateful `FluxKVCache` class, patch the custom block processors, and modify the denoising orchestration to manage a two-phase forward pass (extracting reference latents in Phase 1/Step 0, and reading from cache in Phase 2/Steps 1+).

---

## 2. Technical Specification

### A. Configuring the KV-Cache (`invokeai/backend/flux/kv_cache.py`)

We will introduce a stateful cache helper that manages data-type precision casting and device offloading.

```python
import torch
from typing import Literal

class FluxKVCache:
    def __init__(
        self,
        dtype: torch.dtype = torch.float16,
        device: torch.device | str = "cuda",
    ):
        # Maps block_index -> (cached_k, cached_v)
        self.double_blocks_cache: dict[int, tuple[torch.Tensor, torch.Tensor]] = {}
        self.single_blocks_cache: dict[int, tuple[torch.Tensor, torch.Tensor]] = {}
        self.is_extracting: bool = False
        self.is_enabled: bool = False
        
        # User Configuration Parameters
        self.dtype: torch.dtype = dtype          # torch.float16, torch.bfloat16, torch.float8_e4m3fn, or torch.float8_e5m2
        self.device: torch.device = torch.device(device)  # cuda (GPU) vs cpu (CPU Offload)

    def clear(self):
        self.double_blocks_cache.clear()
        self.single_blocks_cache.clear()
```

### B. Auto-Selection Logic (`invokeai/backend/flux/kv_cache_config.py`)

When the user selects **"Auto"** for precision or storage location, the backend dynamically determines the optimal settings based on the system's available CUDA VRAM:

```python
import torch

def get_optimal_kv_cache_settings() -> tuple[torch.dtype, str]:
    """Dynamically determines the best KV Cache configuration based on available GPU VRAM.
    
    Returns:
        tuple[torch.dtype, str]: (optimal_dtype, optimal_device)
    """
    if not torch.cuda.is_available():
        return torch.float16, "cpu"

    # Total VRAM in Gigabytes
    total_vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
    
    # Preferred compute / cache precision based on hardware support
    is_bf16_supported = torch.cuda.is_bf16_supported()
    has_fp8 = hasattr(torch, "float8_e4m3fn") and hasattr(torch, "float8_e5m2")
    
    # 1. Ultra High-End (>= 20GB VRAM: e.g., RTX 3090, 4090)
    # Run full precision on GPU for maximum speed and quality.
    if total_vram_gb >= 20.0:
        dtype = torch.bfloat16 if is_bf16_supported else torch.float16
        return dtype, "cuda"
        
    # 2. Mid-to-High End (12GB - 20GB VRAM: e.g., RTX 4070 Ti, 4080)
    # Run compressed FP8_E4M3FN (higher mantissa/accuracy) on GPU to save VRAM with minimal impact.
    if total_vram_gb >= 12.0:
        if has_fp8:
            return torch.float8_e4m3fn, "cuda"
        dtype = torch.bfloat16 if is_bf16_supported else torch.float16
        return dtype, "cuda"
        
    # 3. Mid-Range (8GB - 12GB VRAM: e.g., RTX 3080 10GB, 4070, 4060 Ti)
    # Run FP8_E4M3FN offloaded to CPU to save GPU VRAM, falling back to GPU if PCIe transfers are undesired.
    # Alternatively, we can use FP8_E5M2 to further compress or offload.
    if total_vram_gb >= 8.0:
        if has_fp8:
            # CPU Offloaded FP8 to keep maximum space for model weights
            return torch.float8_e4m3fn, "cpu"
        return torch.float16, "cpu"

    # 4. Low-End / Budget (< 8GB VRAM)
    # Always offload to CPU. Use FP8 if supported, otherwise FP16.
    if has_fp8:
        return torch.float8_e4m3fn, "cpu"
    return torch.float16, "cpu"
```

### C. Custom Block Processor Modifications (`custom_block_processor.py`)

Both `CustomDoubleStreamBlockProcessor` and `CustomSingleStreamBlockProcessor` are modified to handle cache storage and retrieval.

#### Double Stream Block Injection:
```python
# Inside CustomDoubleStreamBlockProcessor.custom_double_block_forward:
if kv_cache and kv_cache.is_enabled:
    if kv_cache.is_extracting:
        # Step 0 (Extract): Cast keys/values to target precision and transfer to selected device
        k_cached = k.to(device=kv_cache.device, dtype=kv_cache.dtype)
        v_cached = v.to(device=kv_cache.device, dtype=kv_cache.dtype)
        kv_cache.double_blocks_cache[block_index] = (k_cached, v_cached)
    else:
        # Steps 1+ (Cached Inference): Retrieve, cast back to active GPU execution dtype, and concatenate
        cached_k, cached_v = kv_cache.double_blocks_cache[block_index]
        
        # Move cached tensors back to active execution device (e.g. CUDA) and current dtype (e.g. BF16/FP16)
        cached_k = cached_k.to(device=k.device, dtype=k.dtype)
        cached_v = cached_v.to(device=v.device, dtype=v.dtype)
        
        # Prepend the reference image KV tokens along the sequence dimension (dim=2)
        k = torch.cat((cached_k, k), dim=2)
        v = torch.cat((cached_v, v), dim=2)
```

#### Single Stream Block Injection:
```python
# Inside CustomSingleStreamBlockProcessor.custom_single_block_forward:
if kv_cache and kv_cache.is_enabled:
    if kv_cache.is_extracting:
        # Step 0 (Extract): Cast keys/values to target precision and transfer to selected device
        k_cached = k.to(device=kv_cache.device, dtype=kv_cache.dtype)
        v_cached = v.to(device=kv_cache.device, dtype=kv_cache.dtype)
        kv_cache.single_blocks_cache[block_index] = (k_cached, v_cached)
    else:
        # Steps 1+ (Cached Inference): Retrieve, cast back to active GPU execution dtype, and concatenate
        cached_k, cached_v = kv_cache.single_blocks_cache[block_index]
        
        cached_k = cached_k.to(device=k.device, dtype=k.dtype)
        cached_v = cached_v.to(device=v.device, dtype=v.dtype)
        
        k = torch.cat((cached_k, k), dim=2)
        v = torch.cat((cached_v, v), dim=2)
```

---

## 3. Hardware Tradeoffs & Performance Profiles

Providing these parameters allows the system to scale gracefully across different GPU models:

| Configuration | Precision | Storage | VRAM Saving | Speed | Hardware Suitability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High Performance** | `FP16` / `BF16` | `GPU` | 0% | **100% (Fastest)** | RTX 3090/4090, V100/A100 (24GB+ VRAM) |
| **VRAM Balanced (Default FP8)** | `FP8_E4M3FN` | `GPU` | ~50% | **95%** | RTX 3080/4070 (10GB-16GB VRAM) |
| **Dynamic Range FP8** | `FP8_E5M2` | `GPU` | ~50% | **95%** | Alternate FP8 flavor (useful for high-contrast/range) |
| **Memory Safe** | `FP16` / `BF16` | `CPU` | ~90% | **60%-70%** (PCIe overhead) | Systems with ample System RAM but 12GB VRAM |
| **Low-End VRAM** | `FP8` | `CPU` | **~95% (Max)** | **40%-50%** (PCIe + casting) | RTX 3060/4060, older 8GB VRAM cards |

---

## 4. Denoising Loop Integration (`denoise.py`)

The orchestration logic in `invokeai/backend/flux/denoise.py` will:
1. Accept the `kv_cache: FluxKVCache` object.
2. Initialize and configure the parameters before step execution.
3. During Step 0, run with `is_extracting = True` on the reference latents.
4. During Steps 1+, run with `is_extracting = False` on the generation latents.

---

## 5. Invocation Nodes & API Layer (`invokeai/app/invocations/`)

In `FluxDenoiseInvocation`, we will add three new input fields:

1. **`enable_kv_cache`**: `bool` (Default: `False`)
2. **`kv_cache_precision`**: `Literal["auto", "float16", "bfloat16", "float8_e4m3fn", "float8_e5m2"]` (Default: `"auto"`)
3. **`kv_cache_storage`**: `Literal["auto", "gpu", "cpu"]` (Default: `"auto"`)

---

## 6. Frontend UI Design

We will present these configurations in a dedicated **KV-Cache Control panel** in the generation settings sidebar:

* **Enable KV-Cache (Toggle)**
* **Cache Precision (Dropdown/Segmented Control)**
  * `Auto (Recommended)` (Default)
  * `FP16` / `BF16` (High Quality)
  * `FP8 E4M3FN` (Standard FP8)
  * `FP8 E5M2` (Alternative FP8)
* **Storage Location (Dropdown/Segmented Control)**
  * `Auto (Recommended)` (Default)
  * `GPU (Fastest)`
  * `CPU (VRAM Offloading)` (Recommended for <= 8GB VRAM)
