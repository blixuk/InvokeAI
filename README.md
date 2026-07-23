<div align="center">

![project hero](https://github.com/invoke-ai/InvokeAI/assets/31807370/6e3728c7-e90e-4711-905c-3b55844ff5be)

# Invoke - Professional Creative AI Tools for Visual Media

[![discord badge]][discord link] [![latest release badge]][latest release link] [![github stars badge]][github stars link] [![github forks badge]][github forks link] [![CI checks on main badge]][CI checks on main link] [![latest commit to main badge]][latest commit to main link] [![github open issues badge]][github open issues link] [![github open prs badge]][github open prs link] [![translation status badge]][translation status link]

</div>

Invoke is a leading creative engine built to empower professionals and enthusiasts alike. Generate and create stunning visual media using the latest AI-driven technologies. Invoke offers an industry leading web-based UI, and serves as the foundation for multiple commercial products.

- Free to use under a commercially-friendly license
- Download and install on compatible hardware
- Generate, refine, iterate on images, and build workflows

![Highlighted Features - Canvas and Workflows](https://github.com/invoke-ai/InvokeAI/assets/31807370/708f7a82-084f-4860-bfbe-e2588c53548d)

---
> ## 📣 Are you a new or returning InvokeAI user?
> Take our first annual [User's Survey](https://forms.gle/rCE5KuQ7Wfrd1UnS7)

---

# Documentation

| **Quick Links**                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Installation and Updates][installation docs] - [Documentation and Tutorials][docs home] - [Bug Reports][github issues] - [Contributing][contributing docs] |

# Installation

To get started with Invoke, [Download the Launcher](https://github.com/invoke-ai/launcher/releases/latest).

## Troubleshooting, FAQ and Support

Please review our [FAQ][faq] for solutions to common installation problems and other issues.

For more help, please join our [Discord][discord link].

## Features

Full details on features can be found in [our documentation][features docs].

### Web Server & UI

Invoke runs a locally hosted web server & React UI with an industry-leading user experience.

### Unified Canvas

The Unified Canvas is a fully integrated canvas implementation with support for all core generation capabilities, in/out-painting, brush tools, and more. This creative tool unlocks the capability for artists to create with AI as a creative collaborator, and can be used to augment AI-generated imagery, sketches, photography, renders, and more.

### Reference Image Tools: Grid Stitching & Preprocessing

Invoke now supports advanced reference image preparation workflows directly inside the Control Layers panel:
- **Image Grid Stitching**: Combine 2 to 6 images (uploaded locally or selected from your gallery) into a single, high-fidelity reference image grid. Supports customizable canvas dimensions, slot gaps, scaling modes (crop/fill vs fit/pad), vertical/horizontal/grid layouts, and customizable background colors.
- **ControlNet Preprocessor Runner**: Process any input image or active reference image with up to 14 different preprocessors (Canny, Depth, HED, LineArt, MLSD, Face, PiDiNet, Sketch, etc.) on the fly using the backend execution engine, and apply the generated map immediately as a reference image.

### Workflows & Nodes

Invoke offers a fully featured workflow management solution, enabling users to combine the power of node-based workflows with the ease of a UI. This allows for customizable generation pipelines to be developed and shared by users looking to create specific workflows to support their production use-cases.

### AI Assistant & Ollama Integration

Invoke now features a built-in AI Assistant powered by Ollama. Communicate directly with a powerful local LLM from within the workspace. Features include full vision capabilities (chat with your generated images), rich markdown rendering with syntax-highlighted code blocks, and context-aware generation prompting.

### Detailer (After Detailer) GUI

Invoke now features a native, fully integrated **Detailer** accordion directly inside the sidebar controls for both the Generation and Unified Canvas workspaces:
- **Dynamic Parameter Presets**: Optimal values for denoising strength, padding, mask blur, and detection thresholds are dynamically loaded and visual sliders updated in real time depending on whether you select Face (MediaPipe), Face (YOLOv8), Hand (YOLOv8), or Person (YOLOv8).
- **Save Before/After Comparison**: With a simple toggle, automatically output the original generation and the detailed version to the gallery side-by-side for instant comparison.
- **Dedicated Prompt Overrides**: Enter detailed prompt overrides (e.g., specific hair styles, eye color, skin textures) for the crop regions, or let it fall back seamlessly to the main prompt when empty.
- **Custom Detector Checkpoints**: Install and classify any third-party YOLO/face/hand/person detection checkpoint under the new `Detailer Detector` model type (supports both ONNX and Checkpoint formats), and dynamically select them in the GUI dropdown.

### Pixel Diffusion Decoder (PiD) Integration

Invoke now features a native, fully integrated **Pixel Diffusion Decoder (PiD)** implementation under Advanced Settings:
- **High-Fidelity Latent Decoding**: Replaces standard VAE decoders with a conditional pixel-space diffusion model to unify decoding and upsampling in a single generative pass.
- **Support for Uncensored/Abliterated Gemma 2**: Choose dynamically between standard Gemma 2 and our custom abliterated (`gemma-2-2b-it-abliterated`) text encoder for censorship-free generations.
- **Smart VRAM Management**: Automatically offloads idle models (e.g. Flux Transformer, Qwen3) to system memory before invoking the PiD process, freeing up over 12 GB of VRAM and avoiding CUDA Out-of-Memory (OOM) errors.
- **Interactive Sidebar Control Panel**: Supports steps, detail sharpness, resolution variant (2K/4K), and discrete upscale factors (1x, 2x, 4x, 8x).

### Spectral-Energy Guided Attention (SEGA) Integration

Invoke now features a native, fully integrated **Spectral-Energy Guided Attention (SEGA)** implementation:
- **Resolution Extrapolation for FLUX.2**: Generates high-fidelity images at resolutions far exceeding training size by dynamically modulating the RoPE (Rotary Position Embedding) frequencies using real-time spectral-energy analysis of attention matrices.
- **Dedicated Sidebar Accordion GUI**: Toggle SEGA on/off and fine-tune the Extrapolation Scale (Alpha) via an elegant parameter slider.
- **Dynamic RoPE Calibration**: Integrates seamlessly with FLUX.2 Klein 4B and 9B architectures, automatically scaling attention weights for pristine multi-megapixel generation.

### Templates & Style Presets

A dedicated Templates tab provides a full-page grid to create, edit, organize, and delete prompt templates and style presets. Includes a "Style Reference" toggle to automatically inject template cover images into the generation context via IP-Adapter or Kontext conditioning.

### Character Prompt Generation

Invoke features a highly granular **Character Prompt Generator** inside the Generate workspace. 
- **Granular Attribute Control**: Over 30 configurable physical and apparel attributes categorized cleanly into General, Hair, Face & Makeup, and Outfit & Accessories.
- **Persistent Character Library**: Save, load, and manage custom character presets via the robust Saved Characters modal, ensuring long-term consistency across sessions.
- **Integrated Visual References**: Drag and drop images straight from the gallery to bind reference images to character profiles. The pipeline automatically translates these references into IP-Adapter or Kontext conditioning for seamless character consistency.
- **Dynamic Prompt Compilation**: Automatically transforms complex layered clothing, makeup, and physical traits into cohesive and optimized text prompts for image generation.
- **Live Preview**: A live preview text box shows exactly how the final prompt string is being constructed behind the scenes.
- **Multiple Characters**: Support for configuring multiple distinct characters within a single generation flow.

### CivitAI Integration

Streamlined downloading of models directly from CivitAI. Supports authenticated downloads for restricted content using API tokens, gracefully bypassing HTML login traps and ensuring seamless integration into the Model Manager.

### Board & Gallery Management

Invoke features an organized gallery system for easily storing, accessing, and remixing your content in the Invoke workspace. Images can be dragged/dropped onto any Image-base UI element in the application, and rich metadata within the Image allows for easy recall of key prompts or settings used in your workflow.

- **Resizable & Collapsible Panels**: Fully customizable workspace layout with resizable side panels and collapsible board/tag lists.
- **Interactive Image Viewer**: The main image viewer supports smooth mouse-wheel zooming, middle-click panning, and dedicated zoom controls while preserving core drag-and-drop mechanics.
- **Asset Management**: Dedicated viewing options and layouts for managing generated images, uploaded assets, and all media components in one place.

### Model Support
- SD 1.5
- SD 2.0
- SDXL
- SD 3.5 Medium
- SD 3.5 Large
- CogView 4
- Flux.1 Dev
- Flux.1 Schnell
- Flux.1 Kontext
- Flux.1 Krea
- Flux Redux
- Flux Fill
- Flux.2 Klein 4B
- Flux.2 Klein 9B
- Z-Image Turbo
- Z-Image Base
- DreamLite
- Krea 2
- Anima
- Qwen Image
- Qwen Image Edit
- Nano Banana (API Only)
- GPT Image (API Only)
- Wan (API Only)
- Ideogram 4 (API Only)

### Other features

- Support for ckpt, diffusers, and some gguf models
- Upscaling Tools
- Embedding Manager & Support
- Model Manager & Support
- Workflow creation & management
- Node-Based Architecture
- Object Segmentation & Selection Models (SAM / SAM2)

## Contributing

Anyone who wishes to contribute to this project - whether documentation, features, bug fixes, code cleanup, testing, or code reviews - is very much encouraged to do so.

Get started with contributing by reading our [contribution documentation][contributing docs], joining the [#dev-chat] or the GitHub discussion board.

We hope you enjoy using Invoke as much as we enjoy creating it, and we hope you will elect to become part of our community.

## Thanks

Invoke is a combined effort of [passionate and talented people from across the world][contributors]. We thank them for their time, hard work and effort.

Original portions of the software are Copyright © 2024 by respective contributors.

[features docs]: https://invoke.ai/
[faq]: https://invoke.ai/troubleshooting/faq/
[contributors]: https://invoke.ai/contributing/contributors/
[github issues]: https://github.com/invoke-ai/InvokeAI/issues
[docs home]: https://invoke.ai
[installation docs]: https://invoke.ai/start-here/installation/
[#dev-chat]: https://discord.com/channels/1020123559063990373/1049495067846524939
[contributing docs]: https://invoke.ai/contributing/
[CI checks on main badge]: https://flat.badgen.net/github/checks/invoke-ai/InvokeAI/main?label=CI%20status%20on%20main&cache=900&icon=github
[CI checks on main link]: https://github.com/invoke-ai/InvokeAI/actions?query=branch%3Amain
[discord badge]: https://flat.badgen.net/discord/members/ZmtBAhwWhy?icon=discord
[discord link]: https://discord.gg/ZmtBAhwWhy
[github forks badge]: https://flat.badgen.net/github/forks/invoke-ai/InvokeAI?icon=github
[github forks link]: https://useful-forks.github.io/?repo=invoke-ai%2FInvokeAI
[github open issues badge]: https://flat.badgen.net/github/open-issues/invoke-ai/InvokeAI?icon=github
[github open issues link]: https://github.com/invoke-ai/InvokeAI/issues?q=is%3Aissue+is%3Aopen
[github open prs badge]: https://flat.badgen.net/github/open-prs/invoke-ai/InvokeAI?icon=github
[github open prs link]: https://github.com/invoke-ai/InvokeAI/pulls?q=is%3Apr+is%3Aopen
[github stars badge]: https://flat.badgen.net/github/stars/invoke-ai/InvokeAI?icon=github
[github stars link]: https://github.com/invoke-ai/InvokeAI/stargazers
[latest commit to main badge]: https://flat.badgen.net/github/last-commit/invoke-ai/InvokeAI/main?icon=github&color=yellow&label=last%20dev%20commit&cache=900
[latest commit to main link]: https://github.com/invoke-ai/InvokeAI/commits/main
[latest release badge]: https://flat.badgen.net/github/release/invoke-ai/InvokeAI/development?icon=github
[latest release link]: https://github.com/invoke-ai/InvokeAI/releases/latest
[translation status badge]: https://hosted.weblate.org/widgets/invokeai/-/svg-badge.svg
[translation status link]: https://hosted.weblate.org/engage/invokeai/
[nvidia docker docs]: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
[amd docker docs]: https://rocm.docs.amd.com/projects/install-on-linux/en/latest/how-to/docker.html
