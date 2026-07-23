# 🎛️ Best Detailer Settings for Premium Results

To get the highest quality, most realistic results from each detailer model without creating seams, floating parts, or identity shifts, use the curated configurations below.

---

## 🧑‍🎨 1. Face (YOLOv8)
*Best for general face restoration, adding realistic skin texture, clear eyes, and correcting slight facial deformities.*

| Parameter | Recommended Value | Why It Works |
| :--- | :---: | :--- |
| **Denoising Strength** | `0.35` - `0.45` | **The Sweet Spot.** Anything higher than `0.5` changes the subject's identity entirely or hallucinates faces. Anything lower than `0.3` won't add enough new details or repair flaws. |
| **Padding (Pixels)** | `32 px` | Gives the model enough surrounding context (hair, neck, lighting) to blend the detailed face seamlessly back into the overall portrait. |
| **Mask Blur** | `4 px` | Softens the edges of the face crop to prevent sharp, artificial transitions. |
| **Min Confidence** | `0.5` | Standard safety boundary. Avoids triggering detailing on ambiguous background shapes or shadows. |

---

## ✋ 2. Hand (YOLOv8)
*Best for correcting hand anatomy, resolving extra/missing fingers, and fixing malformed joints.*

| Parameter | Recommended Value | Why It Works |
| :--- | :---: | :--- |
| **Denoising Strength** | `0.50` - `0.60` | **Higher Denoising Required.** Hands require a complete structural rewrite to fix anatomical errors. Lower values will simply trace over the malformed hand. |
| **Padding (Pixels)** | `48` - `64 px` | **Crucial for Hands.** Hands need wider context to align the wrist, arm, and finger orientation with the body. Tight crops result in detached, floating hands. |
| **Mask Blur** | `8 px` | Because denoising is higher, you need a slightly wider blur to smoothly transition the skin tones and lighting back onto the arm. |
| **Min Confidence** | `0.4` | Hand detectors can be slightly less confident on extreme angles, so `0.4` helps capture them, but `0.5` is safer to avoid false hand detections in background clothing or folds. |

---

## 👤 3. Person (YOLOv8)
*Best for detailing full-body figures, enhancing clothing textures, belt buckles, and full armor/outfit sets.*

| Parameter | Recommended Value | Why It Works |
| :--- | :---: | :--- |
| **Denoising Strength** | `0.25` - `0.35` | **Texture focus.** The entire figure is crop-inpainted. High denoising will completely redesign the clothing or pose. Lower denoising enhances existing cloth folds, leather textures, and hair strands without shifting the pose. |
| **Padding (Pixels)** | `12` - `16 px` | Lower padding is needed because the bounding box for a whole person is already huge; extra padding might scale past the canvas margins. |
| **Mask Blur** | `12 px` | A much larger canvas transition area requires a wider blur to merge the entire figure naturally into the background. |
| **Min Confidence** | `0.5` | Prevents the model from trying to detail random background objects that look vaguely humanoid. |

---

## 🎭 4. Face (MediaPipe Mesh)
*Best for tight, high-precision facial refinements, makeup detailing, and minor skin smoothing.*

| Parameter | Recommended Value | Why It Works |
| :--- | :---: | :--- |
| **Denoising Strength** | `0.30` - `0.38` | Mesh detection forms an exact wrap around the face contours instead of a square box. Keep denoising low to maintain precise anatomical integrity. |
| **Padding (Pixels)** | `24 px` | Lower padding is preferred as the mesh wrap keeps the inpainting highly localized. |
| **Mask Blur** | `4 px` | A tight blur is sufficient to blend the exact face boundary cleanly. |
| **Min Confidence** | `0.5` | Standard face lock. |

---

> [!TIP]
> **Pro-Tip on Prompts:** If the main generation prompt is very complex, typing a highly targeted prompt override like `beautiful eyes, realistic detailed skin, 8k resolution` in the **Detailer Prompt (Optional)** input will yield significantly better results than reusing the global prompt!
