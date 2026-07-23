FLUX.2 [Klein] is the fastest model in the Flux family, unifying text-to-image and image editing in one compact architecture. It’s designed for interactive workflows, immediate previews, and latency-critical applications, with distilled variants delivering end-to-end inference around one second while keeping strong quality for single- and multi-reference editing.

Editing support: style transforms, semantic edits, object replacement/removal, multi-reference composition, iterative edits

- Use Natural Language
FLUX works best when your prompt reads like a clear description of the image you want to generate. Natural language helps the model understand what should appear in the image, how the elements relate to each other, and what visual direction to follow. The clearer the description, the easier it is for FLUX to produce a focused and consistent result.

- Text in images
When you want FLUX to generate specific text inside an image, place the exact wording in quotation marks. This makes it clearer that the text should appear visibly in the final image, rather than being treated as part of the general prompt description. Quotation marks help separate written content from the rest of the scene, which gives FLUX a stronger signal to render the words as text.

- Refine As You Go
Strong prompts usually come from iteration, not from trying to write the perfect prompt on the first attempt.

A practical loop is:
- Start with a simple version
- Check what FLUX got right and wrong
- Adjust one important detail at a time

If the image is close but not there yet, tweak the subject, framing, lighting, or style before rewriting everything.

- Image Input
With FLUX.1 Kontext and FLUX.2, your prompt isn’t limited to text. These models accept up to 10 images as additional input alongside your text prompt — allowing you to edit existing images, transfer styles, maintain character consistency across generations, or composite multiple references into a single output.
Red and black butterfly in flight

- Building a Good Prompt
How FLUX reads prompts and how to structure them into clear, controllable image instructions

- Prompt length
FLUX.2 supports prompts up to 32K tokens.

Length,	Words,	Best For
Short,	10-30,	Quick concepts, fast iteration, style exploration
Medium,	30-80,	Most scenes and everyday prompting
Long,	80-300+,	Complex multi-subject scenes or very directed outputs

- Structure helps
The goal is not to write the longest possible prompt. The goal is to give FLUX a clear structure.
A good prompt works like a set of instructions. It tells the model what kind of image you want, what the main subject is, where the scene happens, and how it should feel visually.
One useful way to organize that information is this template:

- Start by describing the image
Start with the core subject or content of the image.

That can be something simple:
- a cat
- a family on a beach
- autumn foliage in a park
Then add the details that make the image more specific and visually interesting.

Useful details include:
- What the subject is doing: looking up, playing, running
- How the action feels: joyfully, fearfully, boldly
- The mood of the image: ominous morning rain, dangerous sunset mountains, nostalgic coffee table

The more relevant detail you provide, the more likely you are to get a compelling result. But each model interprets prompts differently, so the same wording will not behave identically everywhere.

For FLUX, the most reliable pattern is usually:
1. Start with a clear subject
2. Add the main action or state
3. Add mood, context, and visual direction only when they improve the image

- The prompt components
Component,	What it controls,	Example
Image type,	The overall category or framing of the image,	portrait, landscape, macro
Subject,	The main thing you want to see,	a young woman with curly red hair
Location,	The setting or environment,	in a futuristic space station
Style,	The artistic or visual direction,	editorial photography, anime illustration
Camera settings,	Lens, framing, depth of field, shot style,	85mm lens, shallow depth of field
Lighting,	How the image is lit,	soft window light, golden hour sunlight
Colors,	The dominant palette,	muted earth tones, deep green and cream
Effect,	Extra visual treatment,	motion blur, film grain, soft bloom
Additional elements,	Supporting details that enrich the scene,	wind-blown fabric, falling leaves

- Image type
The image type gives FLUX a broad idea of what kind of image to create.
Even before you describe the subject, it affects composition and visual expectations.

Useful starting points:
- Portrait: close-up or medium shot focused on a person or character
- Landscape: wide scene showing nature, architecture, or an environment
- Bird’s-eye view: top-down perspective, as if seen from high above
- Macro: extreme close-up showing fine details
- Abstract: shape, color, or texture-driven composition

If you are learning how prompt parts change the result, start with a simple image type such as portrait. It makes the effect of later additions easier to see.

- Subject
The subject is the main focus of the image.
Be specific when it matters. Clear subjects are easier for FLUX to render consistently than vague ones.

Examples:
- a young woman with curly red hair
- an elderly man with a long white beard
- a cyberpunk teenager with neon blue hair
- a Siamese cat with a blue collar
- a single red rose

- Location
The location sets the scene. It provides context and changes the mood of the image even when the subject stays the same.

Examples:
- in a bustling city street
- on a serene beach at sunset
- in a futuristic space station
- inside a dimly lit jazz club
- in a dense forest after rain

Changing only the location is one of the fastest ways to explore variations on the same concept.

- Style
The style tells FLUX what visual language to use. This can be photographic, illustrative, cinematic, painterly, or highly specific to a medium.

Examples:
- fashion editorial photography
- wildlife documentary style
- anime illustration
- oil painting
- minimalist product photography

If style is central to the result, mention it early and keep it concrete.

- Art form and style
If you want a specific visual effect, describe both the art form and the style.
​
- Photography
Photography is useful when you want realistic images.

You can control:
- framing
- lighting conditions
- lens feel
camera distance
depth of field

Example:
`A child playing on a sunny beach, building a sandcastle, action photography, high shutter speed, soft warm light`

- Painting
Painting prompts work well when you want texture, brushwork, and stronger artistic interpretation.

You can combine:
- techniques such as oil painting or watercolor
- movements such as impressionism or fauvism
- artist references when appropriate

Example:
`Impressionist oil painting of a small robot in a garden`

- Illustration
Illustration is useful when you want a drawn or stylized result rather than a photo-like one.

Examples of illustration directions:
- pencil drawing
- charcoal sketch
- cartoon illustration
- poster illustration

Example:
`Illustration of dinosaurs drawn in a childlike style, cute and playful`

- Digital art
Digital art is useful when you want a more synthetic, graphic, or contemporary visual language.

Example:
`An isolated convenience store in the desert at sunset, lo-fi digital art, nostalgic atmosphere`

- Film still
Film still is useful when you want something cinematic and emotionally charged.

Example:
`Buildings on fire, old film still, smoky atmosphere, dramatic contrast`

- Other art forms

You can also experiment with:
- sculpture
- collage
- street art
- textile art
- installation art
- ceramic art
- lithography

Mixing art forms and styles can lead to strong results, but keep the combination coherent.
​
- Camera settings
The camera settings define how the image is framed or captured. This is most useful when you want a photographic result.

Examples:
- 85mm lens
- wide-angle shot
- close-up framing
- shallow depth of field
- shot from a low angle

Use these when framing matters. If the exact camera look is not important, you can skip this part.

- Framing
Framing controls how the subject is positioned in the image.

Prompt order matters here too. If FLUX keeps pulling too far back, make the subject clear first and move environmental details later in the sentence.

This version can lead to a wider scene than intended:
`Person standing inside a forest fire, strong determined attitude, close-up shot, realistic`

This rewrite usually gives you more control:
`Person with a strong determined expression, forest fire in the background, close-up shot, realistic`

Useful framing language:
- close-up
- medium shot
- wide shot
- overhead view
- point-of-view shot
- dutch angle
- low-angle shot

- Lighting
Lighting shapes contrast, mood, depth, and realism.

Examples:
- soft window light
- golden hour sunlight
- harsh direct flash
- overcast daylight
- neon backlighting

You can also use:
- soft light
- hard light
- dramatic lighting
- morning light
- sunset light
- golden hour

- Colors
Colors define the palette and help FLUX keep the image visually coherent.

Examples:
- muted beige and forest green tones
- deep blue and silver
- warm orange and pink sunset colors
- monochrome black and white
- desaturated pastel palette

- Color scheme
Color scheme is especially useful when you want the entire image to feel unified.

Example:
`A futuristic busy city, purple and green color scheme`

Lighting already influences color, but explicit palette direction helps FLUX stay more consistent.

- Effect
Effect adds visual treatment on top of the base scene.

Examples:
- Film grain
- Soft bloom
- Motion blur
- Bokeh
- Double exposure effect

Use one or two strong effects. Too many can make the image feel unfocused.

- Additional elements
Additional elements are the supporting details that make an image feel complete.

Examples:
- floating dust particles
- wind-blown fabric
- falling leaves
- glowing reflections on wet pavement
- scattered flowers on the table

- Detail and realism
You can also add detail or realism cues when you want the image to feel sharper, more polished, or more believable.

Examples:
- highly detailed
- realistic
- ultrarealistic
- cinematic detail
- sharp texture detail

Avoid stacking too many generic quality terms. One or two strong realism cues are usually enough.

- Build one prompt step by step
Here is the same idea expanded gradually:

1. Start with image type and subject

`portrait, a young woman with curly red hair`

2. Add the location

`portrait, a young woman with curly red hair, in a bustling city street`

3. Add the visual direction

`portrait, a young woman with curly red hair, in a bustling city street, fashion editorial photography, 85mm lens, soft golden hour light`

4. Refine with color and detail

`portrait, a young woman with curly red hair, in a bustling city street, fashion editorial photography, 85mm lens, soft golden hour light, warm amber and charcoal tones, subtle film grain, wind-blown hair and blurred city lights`

- Practical advice
    - Start with the image type and subject.
    - Add style and lighting next if the first result feels generic.
    - Use colors when you want stronger visual cohesion.
    - Add effect and additional elements last. These are refinements, not the foundation.
    - If a prompt gets bloated, remove the parts that do not clearly change the image.

For photorealism, specify camera models, lenses, and film stocks. “Shot on Fujifilm X-T5, 35mm f/1.4” produces more authentic results than just “professional photo.”

- Camera and Lens Simulation
Be specific about camera settings for authentic results:
`Shot on Hasselblad X2D, 80mm lens, f/2.8, natural lighting`
`Canon 5D Mark IV, 24-70mm at 35mm, golden hour, shallow depth of field`

- Art Styles & Illustration
FLUX handles a wide range of artistic styles beyond photorealism. Name the style specifically and describe its visual characteristics.

Style fusion — Combine two styles with a unifying palette:

- Style Fusion Example
`Ancient Greek marble statue precision and anatomical detail, infused with cyberpunk neon lighting, holographic overlays, and electric blue/magenta glow effects, set against dark futuristic environments`

Style + mood annotations — Add explicit tags at the end of your prompt for consistent aesthetics:

`[Scene description]. Style: Country chic meets luxury lifestyle editorial. Mood: Serene, romantic, grounded.`

`[Scene description]. Shot on 35mm film (Kodak Portra 400) with shallow depth of field — subject razor-sharp, background softly blurred.`

- Lighting
Lighting has the greatest single impact on output quality. Describe it like a photographer would — “good lighting” is not enough.

What to describe:
- Source: natural, artificial, ambient
- Quality: soft, harsh, diffused, direct
- Direction: side, back, overhead, fill
- Temperature: warm, cool, golden, blue
- Interaction: catches, filters, reflects on surfaces

- Portrait Lighting
    - Rembrandt lighting (45° key light) — triangle of light on the face for dramatic portraits:
        `Portrait with Rembrandt lighting, key light at 45 degrees, dramatic chiaroscuro effect`
    - Split lighting (90° side light) — half-face illuminated for high contrast:
        `Artistic portrait, split lighting, strong side illumination, dramatic contrast`

- Environmental Light Quality
    - Window light = soft, even illumination
    - Golden hour = warm and soft
    - Blue hour = cool and moody
    - Overhead artificial = harsh and dramatic

- Cinematic Lighting

- Chiaroscuro — high contrast light/shadow for drama:
`Film noir detective scene, single practical desk lamp, strong chiaroscuro lighting`

- Practical lighting — visible light sources in scene for realism:
`Cyberpunk street scene, neon signs and LED strips providing atmospheric lighting`

- Text in Images
FLUX handles text well when prompted correctly. Use this three-step approach:

1. Enclose in Quotation Marks

Use quotes for exact text: "COFFEE SHOP" or "Est. 1952"

2. Describe Placement

Specify where text appears: “The text ‘OPEN’ appears in red neon letters above the door”

3. Specify Font Style

Name the style: “elegant serif typography” or “bold industrial sans-serif lettering”

Neon Sign: `A Entry of a Sushi Restaurant, The text 'OPEN' appears in red neon letters above the door`
Product Advertisement: `Samsung Galaxy S25 Ultra product advertisement, 'Ultra-strong titanium' headline, 'Shielded in a strong titanium frame, your Galaxy S25 Ultra always stays protected' subtext, close-up of phone edge showing titanium frame, dark gradient background, clean minimalist tech aesthetic, professional product photography`
Retro Poster: `Groovy retro poster with the quote "If you love me let me sleep". Bold 70s typography in deep red and warm pink tones. Cream background and bold orange doodle around the text. Funky layout with playful shadow. Style: bold vintage aesthetic, dopamine decor`
Magazine Cover: `Women's Health magazine cover, April 2025 issue, 'Spring forward' headline, woman in green outfit sitting on orange blocks, white sneakers, 'Covid: five years on' feature text, '15 skincare habits' callout, professional editorial photography, magazine layout with multiple text elements`

- Text Rendering Tips
    - Front-load text descriptions for better accuracy
    - Use quotation marks around exact text you want rendered
    - Describe color and effects: “red neon letters”, “gold serif lettering”, “chalk on blackboard”
    - Use hex codes for brand-precise colors: “The logo text ‘ACME’ in color #FF5733”
    - Keep text short — long strings are harder to render accurately
    - Specify font character: serif = traditional/formal, sans-serif = modern, script = elegant, display = bold/impactful
​
Typography Styles Reference
Style, Effect, Example
3D text, Dimensional, impactful, ”raised chrome letters with realistic metal reflections”
Neon effects, Atmospheric, glowing, ”glowing neon text with electric blue light”
Vintage signs, Authentic, weathered, ”weathered painted text with chipped paint and rust”
Environmental, Integrated into scene, ”carved directly into the ancient stone wall”
Object-based, Printed on props, ”printed on a newspaper being read by the character”

- Technical Parameters
Aspect ratios and working without negative prompts

- Aspect Ratios
Choose the ratio that matches the compositional intent of your scene. Mismatched ratios force the model to either crop or pad the composition.

Ratio, Format, Best For
1:1, Square, Social media, profiles, product shots
16:9, Landscape, Widescreen, web headers, presentations
9:16, Portrait, Mobile, stories, vertical editorial
4:3, Standard, Classic photography
3:2, Photo standard, DSLR-style portrait and landscape
21:9, Ultra-wide, Cinematic, panoramic scenes

A landscape-oriented prompt benefits from 16:9; a portrait prompt from 9:16.

- Working Without Negative Prompts
Most FLUX models do not support negative prompts. Even when they can process them, AI models generally struggle with negation — writing “a person without glasses” causes the model to focus on “glasses” and often generate exactly what you were trying to avoid.


- The Replacement Strategy

When you catch yourself writing negative phrases, use this mental process:
- Identify the unwanted element: “no crowds”
- Ask what would fill that space: “What would I see there?”
- Describe the positive: “peaceful solitude” or “empty pathways”

Common replacements:

Instead of…, Write…
“no people", "empty", “deserted”, “solitary"
"without clothes", "bare skin”, “natural form"
"no colors", "monochrome”, “black and white”, “grayscale"
"no text", "clean surfaces”, “unmarked”, “blank"
"no modern elements", "traditional”, “historical”, “period-accurate"
"not dark", "brightly lit”, “sun-drenched"
"not sad", "joyful”, “content"
"not running", "walking peacefully”, “standing still"
"not many", "few”, “single”, “minimal”

- Practical Examples

Context & Setting

- Instead of: “a street with no cars” Write: “a quiet pedestrian walkway with cobblestones”
- Instead of: “a landscape without buildings” Write: “pristine wilderness with untouched natural terrain”
- Instead of: “a room with no furniture” Write: “a spacious empty room with polished wooden floors”

Character & Portrait

- Instead of: “a person without a hat” Write: “a person with natural hair flowing freely”
- Instead of: “a portrait with no glasses” Write: “a portrait showing clear, unobstructed eyes”

Mood and Atmosphere

- Instead of: “not dark or scary” Write: “peaceful, welcoming, and warm atmosphere with soft golden lighting”
- Instead of: “not too realistic” Write: “stylized illustration with simplified forms and bold color blocks”

Compositional Control

- Instead of: “portrait with no background distractions” Write: “portrait with smooth gradient background transitioning from deep blue to black”
​
When Positive Alternatives Don’t Work
If you’re still getting unwanted elements despite positive framing:
- Be more specific about what you do want in that space
- Front-load the positive description — word order signals priority
- Add more descriptive detail to strengthen the positive alternative
- Use environmental context to make the positive element feel natural

On FLUX.2 [klein], what you write is what you get — be descriptive. Other FLUX.2 variants are more forgiving with short prompts.

- Prompt Reference

Cheat sheet with camera terms, lighting and style keywords, and ready-to-use example prompts

- Camera & Lens Cheat Sheet
Term,	Effect
f/1.4 – f/2.8,	Blurry background (shallow depth of field)
f/8 – f/16,	Everything sharp (deep depth of field)
24mm,	Wide angle — shows more of the scene
35mm,	Natural, documentary-style perspective
50mm,	Eye-level, neutral perspective
85mm,	Portrait-ideal, slight background compression
135mm+,	Telephoto — strong background compression
ISO 100,	Clean image, low noise
ISO 1600–3200,	Brighter but grainy — useful for film-style looks
Macro lens,	Extreme close-up detail
Anamorphic lens,	Widescreen cinematic look with oval bokeh

`Shot on Hasselblad X2D, 80mm lens, f/2.8, natural lighting`

- Lighting Keywords
Term,	Effect
Golden hour,	Warm, soft, flattering — just after sunrise or before sunset
Blue hour,	Cool, moody — just before sunrise or after sunset
Overcast,	Flat, even, shadow-free — great for product shots
Rembrandt lighting,	Dramatic triangle of light on the face
Split lighting,	High contrast, half-face illuminated
Chiaroscuro,	Strong light/shadow drama
Backlit / rim light,	Subject glowing at the edges
Soft box / key light,	Studio, controlled, even
Practical lighting,	Light sources visible in the scene (lamps, neon, fire)
Diffused light,	Soft, wrap-around, minimal shadows
Harsh direct light,	Strong shadows, high contrast

`soft, diffused natural light filtering through sheer curtains`

`dramatic side lighting creating deep shadows and highlights`

`golden hour backlighting with lens flare`

- Style Keywords
Category,	Keywords
Photographic,	”shot on Kodak Portra 400”, “35mm film”, “IMAX camera”, “Sony A7IV”, “Hasselblad X2D”, “Canon 5D”
Cinematic,	”cinematic”, “anamorphic lens flare”, “teal and orange color grading”, “film noir”, “Roger Deakins cinematography”
Artistic,	”oil painting”, “watercolor”, “pencil sketch”, “impasto texture”, “Art Nouveau”, “Bauhaus”
Digital art,	”concept art”, “matte painting”, “octane render”, “unreal engine”, “stylized 3D”
Illustration,	”flat design”, “vector illustration”, “comic art”, “anime style”, “graphic novel”, “whimsical”
Vintage, 	”80s vintage photo”, “2000s digicam”, “VHS aesthetic”, “polaroid”, “sepia tone”

- Composition Techniques
Technique,	When to Use,	Example Phrase
Rule of thirds,	Natural, balanced framing,	”composed using rule of thirds”
Leading lines,	Guide the eye through the image,	”diagonal lines leading to main entrance”
Foreground/background layers,	Add depth and dimension,	”strong foreground boulder, background mountains”
Low angle (worm’s eye),	Make subjects powerful and dominant,	”low angle worm’s eye view, dramatic diagonal lines”
High angle (bird’s eye),	Show patterns and spatial relationships, 	”bird’s eye view, geometric patterns of city blocks”
Dutch angle,	Tension and psychological unease,	”dutch angle, psychological tension”
Symmetrical,	Formal, balanced, architectural,	”perfectly symmetrical composition”
Negative space,	Minimal, focused, product,	”minimalist composition with generous negative space”

- Model-Specific Quick Reference

FLUX.2 [klein]:

- What you write is exactly what the model receives
- Write in prose, not keyword lists — describe scenes like a novelist
- Lighting descriptions have the highest single impact on output quality
- Supports image editing with single and multi-reference inputs
- Add Style: [style]. Mood: [mood]. at the end for consistent aesthetics

- Image Editing

Overview of image editing with FLUX.2 — swap backgrounds, replace objects, transfer styles, and combine multi-reference images in natural language.

FLUX.2 brings powerful image editing capabilities across the entire model family. Describe what you want changed in natural language — swap backgrounds, replace objects, transfer styles, adjust lighting — and FLUX.2 makes it happen while maintaining photorealism.

All FLUX.2 variants support multi-reference image editing, allowing you to combine elements from multiple source images into a single coherent result.

Example:
- Starting image:
`A lone wolf standing on a rocky outcropping, bathed in golden light. The wind ruffles its thick grey fur as it gazes across a vast wilderness landscape.`
- Change the Character:
`Replace the wolf with a large silver fox, keeping the same pose — head tilted up, howling. The fox has a thick, bushy tail and piercing amber eyes. It stands in the same spot on the factory floor.`
- Adjust the Composition:
`Zoom out to reveal more of the abandoned factory interior. Show towering rusted machinery on both sides, a collapsed roof section letting in dramatic shafts of light, and debris scattered across a vast concrete floor.`
- Alter the Action:
`The wolf is now lying down peacefully on the factory floor, resting its head on its front paws. Eyes half-closed, calm and relaxed. A small bird has landed on its back.`
- Swap the Setting:
`Change the setting from a natural rock outcropping to have the wolf on the floor of a cavernous, abandoned factory. Shafts of light from shattered skylights pierce the dusty gloom, and illuminate silent, colossal machinery in the background.`

- Reference Images per Model

Model, Reference Images (API), Reference Images (Playground)
FLUX.2 [flex], Up to 8, Up to 10
FLUX.2 [klein] 9B, Up to 4, —
FLUX.2 [klein] 4B, Up to 4, —
FLUX.2 [dev], Recommended max 6, —

More reference images means more control. Use multiple inputs to maintain character consistency, combine furniture from different photos, or transfer styles — all in a single generation.

- Multi-Reference Example

Prompt: `Create a vintage image taken with a Kodak camera, with heavy grain and slight light smudges. Use Image 2 as the location. Insert only the ice skates from Image 1 into Image 2, with the decorations and evening lighting vibe from Image 3. Add more people skating on the ice.`

- Single-Reference Editing

How to edit images using a single reference with FLUX.2

Single-reference editing is the most common workflow: you provide one input image and describe the changes you want. FLUX.2 understands the context of your image and applies edits while preserving what you didn’t ask to change.

Example 1: `Change it to Night`

Example 2: `On the top polaroid photo, diagonally, write in handwritten pink marker: "2020 <3"`

​
Example 3: `Place this can on top of a minimalistic black shiny surface on black background`

- Use Cases
Single-reference editing covers a wide range of creative and professional tasks. Below are the most common categories with real prompt examples.

- Background Replacement
Change or replace the background of your image while keeping the subject intact.

Product on new background: `a professional high end product shot of this bottle in a pile of fresh wet strawberries on white background, studio lighting`

Scene replacement: `Replace the background with a warm cozy home environment.`

- Style Transfer
Transform the visual style or medium of an image — from illustration to photorealism, or from photo to painting.

Photo to oil painting: `Turn the image into an oil painting with thick, textured brushstrokes`

Illustration to photorealism: `Transform the architectural illustration from image 1 into a fully realistic house, natural lighting, real textures for walls windows and roof, realistic landscaping around the house, accurate shadows, real materials such as wood stone and glass, high resolution photorealism, clean perspective, keep the proportions and layout exactly as in the illustration while turning every element into a believable real world version.`

Reskin to mountain vista: `Reskin this into a realistic mountain vista`

- Object Manipulation
Add, remove, or replace objects in a scene. Be specific about what should change and what should stay.

Remove object: `Remove all of the sprinkles while keeping the rest of the image unchanged`

Replace object: `Replace the flower in image 1 with a slice of lemon`

Add object: `Add small goblins climbing the right wall of the gorge`

Replace subject: `Replace the DJ with a polar bear without headphones`

Selective replacement: `Replace the cherries in the right-most jar with multi-colored sprinkles. Change nothing else`

Remove vegetation: `Remove all vegetation moss and greenery from the statues. Keep only the original stone structure with no plants no moss no algae no green tint. Reveal the raw stone texture with visible small cracks and natural erosion.`

Object swap — bike to horse: `Replace the bike with a rearing black horse`

Element replacement — feathers to petals: `Replace all the feathers with rose petals`

- Color & Material Changes
Recolor specific elements or transform materials — FLUX.2 supports hex color codes for precision.

Recolor with hex codes: `Change the cow's white fur to the color #8bc4bb and its black spots to #de4528`

Material transformation — silver: `The butterfly is now made of shiny silver`

Material transformation — ice: `Turn the butterfly into one sculpted from clear ice, with tiny droplets forming across its frozen surface. Create a refined, realistic texture, preserving the original style of the image`

- Lighting, Weather & Season Changes
Shift the time of day, season, or weather conditions with a simple instruction.

Season change — winter: `Change this to Winter`

Time of day — night: `Change it to Night`

Lighting and color mood:  `Fix the lighting and make the entire scene appear in warm autumn colors with sunlight`

- Text Editing
Add, replace, or modify text within images — from simple swaps to full ad layouts.

Simple text replacement: `Change the text to Flux.2Change the text to Flux.2`

Neon sign text: `Change the text on the neon sign to 'zum Schlappen'`

Sign replacement + scene edit: `Replace the shop sign with a red-orange neon sign that says 'Night Bloom', and add a green traffic light on the left side of the frame.`

Ad creation with text overlay: `Use this image to create an ad. Add the text 'Black Friday hasta -50%' on the right side, making sure it does not overlay the clothes. Add a call-to-action button that says 'Take me there'`

- Virtual Try-On & Clothing
Change outfits, add accessories, or adjust clothing colors — great for fashion and e-commerce.

Outfit change: `Change the woman's outfit to a bold fuchsia pink dress against a green studio gradient background.`

Add accessories with hex colors: `Add a short fluffy jacket on her colored #778899, and a hat in the same fluffy style, colored #98AFC7. Keep her pose`

Dress recoloring with detail preservation: `Change the color of the woman's lace wedding dress to sky blue (light blue, #87CEEB), while keeping all lace embroidery details white and fully visible. Preserve the original fabric texture, transparency, patterns, highlights, and natural folds.`

- Pose & Expression Changes
Adjust gaze direction, body pose, or facial expressions of subjects.

Eye/detail correction: `Open the owl's eyes, making them look natural.`

Gaze direction: `The woman is now looking at the camera`

Pose change: `Change the woman's pose to a model-style pose.`#

- Writing Effective Single-Reference Prompts
Be specific about what changes and explicit about what should stay the same. The more precise your instruction, the better the result.

Good prompts:
- “Change the shirt color to red”
- “Replace the background with a sunset beach”
- “Turn this into an oil painting”
- “Add snow to the scene, keep everything else unchanged”

Avoid:
- “Make it better”
- “Improve the lighting”
- “Make it more professional”
- “Fix the image”

- Multi-Reference Editing

Combine multiple input images for style transfer, composites, and editorial scenes

Multi-reference editing combines multiple input images into a single generated output. Use it for fashion composites, interior design, product scenes, and character-consistent variations. When using several references, describe the role of each image so the model knows what to pull from where.

Multi-reference works well for:
- Fashion shoots: Combine clothing items into styled outfits
- Interior design: Place furniture and decor in rooms
- Product composites: Combine multiple products in scenes
- Character consistency: Maintain identity across variations


Example 1: `Create a house for the chickens from image 1 using materials from images 2, 3, 4, and 5. Use the wood from image 5 for the base, the materials from images 2 and 4 for the walls and floor, and the material from image 3 for a small pillow nest. Place the chickens from image 1 in their new home, sitting on the pillow nest. Next to them, include the eggs from image 6. Apply the style of image 1 to the entire new scene.`

Example 2 `A photograph of the woman in image 2 sitting on the swing in image 1 and the cat from image 3 sitting on her lap, all in the style of image 4`

Example 3: `Place the view from image 1 inside the window of image 4, making it the new background seen through the glass. Then place the couple from image 2 seated naturally at the table in image 4, matching scale, lighting, and perspective. Finally, put the food from image 3 on the table in front of them, arranged so it looks like they are sharing the meal together.`

- Use Cases
Multi-reference editing covers a wide range of creative and professional tasks. Below are the most common categories with real prompt examples.

- Scene Compositing
Combine elements from multiple source images into a single coherent scene.

Animal placed in scene: `Take the animal from image 2 and place it naturally inside the bathtub from image 1. Fill the tub with water and bubbles, and add a rubber duck on the animal's head.` 

Underwater room: `Using the corals and fish from the underwater image, place them inside the vintage room as if the entire room is submerged deep in the ocean. The specific coral formations from the first image should grow along the walls, ceiling, and floor, keeping their original shapes and colors.`

- Style & Material Transfer
Apply the visual style, texture, or material of one image onto the content of another.

Impasto style transfer: `An impasto painting of a gigantic fluffy ginger-and-white cat walking through a narrow New York alley. Thick textured brushstrokes, bold color layers, expressive painterly details, and a dramatic sense of scale.`

Animal pattern transfer: `Apply the colors, patterns, and surface tones of the animal in Image 2 to the animal in Image 1. Keep the pose, lighting, and overall composition of Image 1 unchanged.`

Pattern onto plate: `Apply the pattern from image 2 onto the plate in image 1`

- Object Replacement
Replace or fill objects with elements from another reference image.

Fill bottles with liquid: `Fill the bottles in image 1 with the liquid from image 2, matching the color, texture, and translucency of the liquid. Then replace the pile of foam in image 1 with a realistic puddle of the liquid from image 2.`

- Logo & Branding
Place logos from one image onto objects or scenes in another.

Logo engraved in tree: `Engrave the logo from image 2 into the tree trunk in image 1`

Smoke shaped as logo: `Shape the smoke in image 1 so that it forms the logo from image 2`

- Writing Effective Multi-Reference Prompts
Be specific about what changes and clear about the target state. Reference image locations when needed (e.g., “image 1”, “image 2”) and let the references provide visual context.

Good prompts:
- “Add dramatic storm clouds to the sky”
- “Change her dress from blue to deep burgundy”
- “Age this portrait by 30 years”
- “Change image 1 to match the style of image 2”

Avoid:
- “Make it better”
- “Improve the lighting”
- “Make it more professional”
- “Fix the image”

- Text-to-Image Use Cases

- Photorealistic Images

Generate photorealistic images with FLUX.2 across macro photography, cinematic landscapes, and documentary scenes using lens and lighting prompts.

FLUX.2 excels at generating photorealistic images across a wide range of subjects — from macro photography to cinematic landscapes and documentary scenes. Prompt the model as if describing a real photograph: specify lens, lighting, framing, and texture details for maximum realism.

To get believable photorealism, prompt the model as if a real photo is being captured in the moment. Use photography language (lens, lighting, framing) and explicitly ask for real texture (pores, wrinkles, fabric wear, imperfections).

- HEX Color Code Prompting
Use hex color codes in FLUX.2 prompts for precise color matching — ideal for brand consistency, design work, and exact color control.

FLUX.2 supports precise color matching using hex codes. Useful for brand consistency, design work, and any scenario where exact colors matter. Signal hex colors with keywords like “color” or “hex” followed by the code, and associate each hex value clearly with a specific object or surface.

Basic Syntax
Signal hex colors with keywords like “color” or “hex” followed by the code

Example 1: `a vintage illustration of an apple in color #0047AB with a heart-shaped cutout in the middle, on a white background`
Example 2: `A modern living room with warm terracotta walls in hex #C4725A, a large L-shaped sectional sofa in deep teal hex #1B6B6F, and golden amber hex #E8A847 accent pillows, throw blanket, and a velvet ottoman.`
Example 3: `sunflower in color #C92695`
Example 4: `An aesthetically pleasant liquid lucid composition of predominantly wintery colors with deep, rich and saturated #00FF2F #0D00FF #FF0000`

Gradient Colors
Apply gradients by specifying start and end colors:

Example 1: `A vase on a table in living room, the color of the vase is a gradient, starting with color #02eb3c and finishing with color #edfa3c. The flowers inside the vase have the color #ff0088`
Example 2: `A round silk throw pillow resting on a light gray linen sofa, the fabric of the pillow shows a radial gradient from rich purple (#6A0DAD) at the center fading outward to warm gold (#FFD700) at the edges, even ambient indoor lighting, close-up perspective.`
Example 3: `A wide panoramic view of a vast open sky stretching above a flat horizon line hills. The sky fills the entire frame and displays three distinct horizontal color zones blending smoothly into each other. The upper portion of the sky is deep indigo (#1B0A3E), gradually transitioning through the middle into a warm burnt amber (#CF6A2E), and the lowest section near the horizon glows in soft rose pink (#E8728A).`
Example 4: `Studio product still, seamless gradient backdrop transitioning left-to-right from hot pink (#FF0080) through violet-purple (#7928CA) into electric cobalt blue (#0070F3), velvet smooth, zero banding. Single hero product centered, matte surface with soft specular catch. Large softbox 45° camera-left, rim light camera-right for edge definition. 85mm lens, f/8, dead-center eye-level.`

Hex codes work best when clearly associated with specific objects. Vague references like “use #FF0000 somewhere” may produce inconsistent results.

- JSON Structured Prompting
Use structured JSON prompts for precise control over complex scenes

For complex scenes and production workflows, FLUX.2 interprets structured JSON prompts, giving you precise control over every aspect of your image.

When to use JSON:
- Production workflows requiring consistent structure
- Automation and programmatic generation
- Complex scenes with multiple subjects and relationships
- When you need to iterate on specific elements independently

When natural language works better:
- Quick iterations and exploration
- Simple, single-subject scenes
- When prompt length isn’t a concern
- Creative workflows where flexibility matters

FLUX.2 understands both formats equally well—choose based on your workflow needs.

The Base Schema:
```
{
  "scene": "overall scene description",
  "subjects": [
    {
      "description": "detailed subject description",
      "position": "where in frame",
      "action": "what they're doing"
    }
  ],
  "style": "artistic style",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "lighting": "lighting description",
  "mood": "emotional tone",
  "background": "background details",
  "composition": "framing and layout",
  "camera": {
    "angle": "camera angle",
    "lens": "lens type",
    "depth_of_field": "focus behavior"
  }
}
```

Building a Prompt Step by Step
Let’s build a product shot incrementally to see how each element contributes.

Step 1: Generating a coffee mug
```
{
  "scene": "Professional studio product photography setup with polished concrete surface",
  "subjects": [
    {
      "description": "Minimalist ceramic coffee mug with steam rising from hot coffee inside",
      "pose": "Stationary on surface",
      "position": "Center foreground on polished concrete surface",
      "color_palette": ["matte black ceramic"]
    }
  ],
  "style": "Ultra-realistic product photography with commercial quality",
  "color_palette": ["matte black", "concrete gray", "soft white highlights"],
  "lighting": "Three-point softbox setup creating soft, diffused highlights with no harsh shadows",
  "mood": "Clean, professional, minimalist",
  "background": "Polished concrete surface with studio backdrop",
  "composition": "rule of thirds",
  "camera": {
    "angle": "high angle",
    "distance": "medium shot",
    "focus": "Sharp focus on steam rising from coffee and mug details",
    "lens-mm": 85,
    "f-number": "f/5.6",
    "ISO": 200
  }
}
```

Step 2: Adding a second mug in a different color
```
{
  "scene": "Professional studio product photography setup with polished concrete surface",
  "subjects": [
    {
      "description": "Minimalist ceramic coffee mug with steam rising from hot coffee inside",
      "pose": "Stationary on surface",
      "position": "Center foreground on polished concrete surface",
      "color_palette": ["matte black ceramic"]
    },
    {
      "description": "Minimalist ceramic coffee mug, matching design to the black mug",
      "pose": "Stationary on surface",
      "position": "Right side of the black mug on polished concrete surface",
      "color_palette": ["matte yellow ceramic"]
    }
  ],
  "style": "Ultra-realistic product photography with commercial quality",
  "color_palette": ["matte black", "matte yellow", "concrete gray", "soft white highlights"],
  "lighting": "Three-point softbox setup creating soft, diffused highlights with no harsh shadows",
  "mood": "Clean, professional, minimalist",
  "background": "Polished concrete surface with studio backdrop",
  "composition": "rule of thirds",
  "camera": {
    "angle": "high angle",
    "distance": "medium shot",
    "focus": "Sharp focus on steam rising from coffee and both mugs in frame",
    "lens-mm": 85,
    "f-number": "f/5.6",
    "ISO": 200
  }
}
```

Step 3: Change the color of the steam
```
{
  "scene": "Professional studio product photography setup with polished concrete surface",
  "subjects": [
    {
      "description": "Minimalist ceramic coffee mug with bright red steam rising from hot coffee inside",
      "pose": "Stationary on surface",
      "position": "Center foreground on polished concrete surface",
      "color_palette": ["matte black ceramic", "bright red steam"]
    },
    {
      "description": "Minimalist ceramic coffee mug, matching design to the black mug",
      "pose": "Stationary on surface",
      "position": "Right side of the black mug on polished concrete surface",
      "color_palette": ["matte yellow ceramic"]
    }
  ],
  "style": "Ultra-realistic product photography with commercial quality",
  "color_palette": ["matte black", "matte yellow", "bright red", "concrete gray", "soft white highlights"],
  "lighting": "Three-point softbox setup creating soft, diffused highlights with no harsh shadows",
  "mood": "Clean, professional, minimalist",
  "background": "Polished concrete surface with studio backdrop",
  "composition": "rule of thirds",
  "camera": {
    "angle": "high angle",
    "distance": "medium shot",
    "focus": "Sharp focus on steam rising from coffee and both mugs in frame",
    "lens-mm": 85,
    "f-number": "f/5.6",
    "ISO": 200
  }
}
```

You can include the JSON directly in your prompt, or flatten it into natural language. FLUX.2 understands both formats.

- Typography & Design
Generate clean typography, product ads, magazine covers, and posters with FLUX.2

FLUX.2 generates readable text and clean typography for product marketing materials, magazine layouts, and posters. Describe the headline, placement, and style explicitly.

Example 1: `Samsung Galaxy S25 Ultra product advertisement, 'Ultra-strong titanium' headline, 'Shielded in a strong titanium frame, your Galaxy S25 Ultra always stays protected' subtext, close-up of phone edge showing titanium frame, dark gradient background, clean minimalist tech aesthetic, professional product photography`
Example 2: `Women's Health magazine cover, April 2025 issue, 'Spring forward' headline, woman in green outfit sitting on orange blocks, white sneakers, 'Covid: five years on' feature text, '15 skincare habits' callout, professional editorial photography, magazine layout with multiple text elements`
Example 3: `A White Paper with the Text "Crazy to think all this started with an Avocado." and a really bad drawing with diffusion artifacts of a avocado`
Example 4: `Groovy retro poster with the quote "If you love me let me sleep". Bold 70s typography in deep red and warm pink tones. Cream background and bold orange doodle around the text. Funky layout with playful shadow. Style: bold vintage aesthetic, dopamine decor`

Text Rendering Tips
FLUX.2 can generate readable text when you describe it clearly:
- Use quotation marks: “The text ‘OPEN’ appears in red neon letters above the door”
- Specify placement: Where text appears relative to other elements
- Describe style: “elegant serif typography”, “bold industrial lettering”, “handwritten script”
- Font size: “large headline text”, “small body copy”, “medium subheading”
- Color: Use hex codes for brand text: “The logo text ‘ACME’ in color #FF5733”

- Infographics
Generate clean, structured infographics with FLUX by specifying layout, content hierarchy, icons, and color palette in your prompts.


FLUX can generate clean, visually appealing infographics from descriptive prompts. Specify the layout, content hierarchy, icons, and color palette to get structured visual information designs.

Be explicit about the layout structure (steps, sections, columns) and visual style (minimalist, colorful, corporate). The more specific your content hierarchy, the better the result.

Example 1: `Create a clear colorful infographic that explains step by step how to make a sandwich. Use simple icons and minimal text. Include the following steps with numbered sections. One choose the type of bread. Two add a spread. Three place the vegetables. Four close the sandwich and cut it in half. Use a friendly visual style with soft rounded shapes. Add small English labels next to each icon for clarity.`
Example 2: `Create a cute minimalist infographic that shows how the love for pistachio ice cream increases with age. Use soft pastel colors, simple icons and a clean layout. Include a small girl with a tiny pistachio scoop at the left, a teenager girl with a medium scoop in the middle, and an adult woman with a big pistachio ice cream at the right. Add the text 'Pistachio love grows with you' in a friendly rounded font at the top.`
Example 3: `Minimal vector style infographic of a CNN neural network, white background, centered horizontal layout, very clean and sleek, on the far left a rounded square placeholder with a soft grey border and inside the text 'Input image', to its right a simple arrow pointing to a rounded rectangle with soft pastel fill and the text 'Convolution layer', then another arrow pointing to a rounded rectangle with the text 'Pooling layer', then a thin arrow leading to a horizontal rounded pill shape with the text 'Flatten', then an arrow leading to a single circle on the right with the text 'Output: Cat'`
Example 4: `Create a clean, minimal infographic titled 'How Plants Grow' showing 6 steps vertically: Seed, Water, Sunlight, Soil & Nutrients, Growth, Flowers & Seeds. Use simple icons, short descriptions, a time arrow on the left side, and a white background with a friendly educational style.`

- World Knowledge
Leveraging FLUX’s world knowledge in image generation

FLUX models encode extensive world knowledge — landmarks, architectural styles, cultural references, and geographic features. Simply name a real place or concept, and the model renders it with remarkable accuracy.

Example 1: `The Vik Church in Iceland, with a dark blue sky and mountains with snow in the background, is captured in this night photography. The color scheme features white and red, and the high-resolution photography showcases a real photo style with a bird's eye view of the houses at the foot of the mountain.`
Example 2: `A boy in a white thobe runs across the marble courtyard of the Sheikh Zayed Grand Mosque in Abu Dhabi at midday. The reflective white marble surface mirrors the arched colonnades and central dome above. Harsh noon sun. Stark white, pale sky blue, soft shadow geometry. Wide angle, low angle, figure small in frame.`
Example 3: `Ukiyo-e woodblock print style of Mount Fuji with cherry blossoms, showing characteristic flat colors, bold outlines, and traditional composition`
Example 4: `An elderly Tibetan monk in burgundy and saffron robes turns a row of copper prayer wheels along the outer wall of the Jokhang Temple in Lhasa. Late afternoon sidelight. Stone wall worn smooth. Shadow falls long across the flagstone floor. Warm ochre, aged copper, deep burgundy.`

- UI Mockups
Generate website layouts, app interfaces, and game UI mockups with FLUX from descriptive prompts about structure and visual style.

FLUX can generate website layouts, app interfaces, and game UIs directly from descriptive prompts. Describe the layout structure, content sections, and visual style to get usable design concepts.

Example 1: `Sophisticated landing page for 'Catwalk' artisanal cat clothing brand featuring British Shorthair wearing custom-fitted cashmere sweater, soft pastel color palette with blush pink and sage green accents, 'CATWALK' logo in refined typography, 'BESPOKE FASHION FOR DISCERNING CATS' main headline, carousel of runway photos, craftsmanship video showing hand-stitching process, size consultation booking form, gift card options, press mentions from Vogue Pets and Harper's Bazaar, clean modern design with subtle textile textures and premium feel.`
Example 2: `2003 website with images of weird old people on it photoshopped onto images of Mediterranean food. The website is named 'Rotten Mediterranean Cuisine'. The faces of the old people are angry or crying, its such a weird website`
Example 3: `Screenshot of a website about people using wheelchairs in fun situations, an old lady is flying down some stairs on a wheel chair, an old man going down a half pipe in a wheelchair, someone just flying through the air above traffic in a wheelchair. The website is named 'Holy Rollers', its got a 2004 web aesthetic`
Example 4: `A cozy suburban life simulation game where all the characters are sloths living ordinary human lives — mowing the lawn in slow motion, sipping coffee, awkwardly socializing at a barbecue, interior design menu UI visible, realistic 3D style.`

- Editing Use Cases

- Style Transfer
Re-render images in different artistic mediums with FLUX.2 image editing while preserving original composition, subject, and key details.

Transform any image into different artistic styles
Style transfer lets you re-render a scene in a completely different artistic medium while preserving the original composition, subject, and key details.

- Fashion
Change outfits, add accessories, and recolor garments on existing photos with FLUX.2, using hex color codes for precise control.

FLUX.2 can change outfits, add accessories, recolor garments, and adapt clothing styles on existing photos. Use hex color codes for precise color control and describe fabric details to preserve realism.

Examples:
- Virtual try-on from product image
- Full outfit change
- Precise dress recoloring
- Add accessories with hex colors
- Seasonal outfit + scene change
- Fashion editorial — volcanic landscape
`A dramatic geological photograph captured on expired Agfachrome 100 slide film cross-processed from 1990 with a 35mm spherical lens at f/8, featuring model standing on black lava rock field. The model wears the outfit, positioned on jagged basalt formations, red jersey creating stark color contrast against black rock. Background shows otherworldly volcanic landscape - sharp lava rocks, steam vents releasing white smoke, distant active lava glow, ash-covered ground, no vegetation, alien barren terrain. Overcast grey sky with volcanic ash haze at 1/250. Cross-processed Agfachrome showing extreme contrast, desaturated landscape with punchy red jersey, cyan-magenta split, crushed blacks in rocks, blown highlights in steam, heavy grain. Composition emphasizes post-apocalyptic fashion editorial. Hiroshi Sugimoto seascapes minimalism, Andreas Gursky epic landscapes, sci-fi fashion photography aesthetic.`
- Fashion editorial — gas station night
`A medium-wide fashion photograph captured on expired Kodak Portra 800 film pushed one stop from 1990 with a 50mm spherical lens at f/2, featuring male model at abandoned gas station at night. The model wears the outfit, leaning casually against vintage fuel pump with hands in trouser pockets, head slightly tilted in confident pose. Background shows derelict gas station - peeling paint on pump, cracked concrete, flickering neon sign casting magenta-green glow, distant highway lights. Deep blue night sky. Single sodium vapor streetlight creating harsh orange-yellow illumination from above at 1/60 second. Expired pushed Portra showing heavy grain structure, warm orange cast, cyan-magenta split, soft contrast, glowing highlights around neon, elevated saturation. Composition emphasizes urban decay meets sportswear luxury. 1990s hip-hop fashion editorial aesthetic meets Juergen Teller snapshot style.`

- Drawing to Image (Rendering)
Rendering drawings into images with FLUX editing

FLUX.2 can transform sketches, illustrations, and stylized art into photorealistic renders. Upload a drawing and describe the target realism level — from simple “make it realistic” to detailed material specifications.
​
Examples:
- Simple drawing to photo
- Architectural illustration to photorealism
- Quick realism conversion
- 3D with real materials
- Photo to pastel illustration
- Physical material transformation

- Lighting and Weather Transformation
Transforming lighting and weather in images with FLUX editing

FLUX.2 can shift the time of day, season, and weather conditions of any scene. Simple instructions like “Change this to Winter” work well, and you can combine multiple environmental changes in a single prompt.
​
- Object Removal
Cleanly remove objects, watermarks, and blemishes from images with FLUX.2 image editing while seamlessly filling the surrounding background.

FLUX.2 can cleanly remove objects, watermarks, blemishes, and unwanted elements from images while seamlessly filling the void. Be specific about what to remove and what to preserve.

- Interior Design
Use FLUX.2 to repaint walls, swap flooring, restyle rooms, and adjust lighting in existing interior photos for instant design visualization.

FLUX.2 can transform interior spaces — repaint walls, swap flooring, restyle rooms, and adjust lighting. Upload a photo of a room and describe the changes for instant design visualization.

- Product Consistency
Maintaining product consistency across image edits with FLUX

FLUX.2 keeps product identity intact while changing context, background, or presentation. Upload a product photo or logo and describe the new setting — the model preserves branding, labels, shapes, and materials.

- Character & Style Consistency
Maintaining consistent characters and styles across image edits with FLUX

FLUX.2 can maintain a character’s identity — face, clothing, proportions, and style — across multiple generations. This is essential for editorial shoots, storyboards, product campaigns, and any workflow where visual continuity matters.
​
How It Works
Character consistency in FLUX.2 relies on multi-reference editing. You provide one or more reference images of your character, then describe the new scene, pose, or context. FLUX.2 preserves the character’s identity while adapting them to the new setting.
​
Examples:
- Iterative editing with consistent identity
FLUX excels at maintaining character consistency even after multiple sequential edits. Starting from a single reference photo, each edit changes the scene while the character stays recognizable throughout the entire sequence.

    - Input image
    - Edit 1: Remove the object from her face
    - Edit 2: She is now taking a selfie in the streets of Freiburg, it's a lovely day out.
    - Edit 3: It's now snowing, everything is covered in snow.

- Fashion editorial — consistent characters across scenes
With multi-reference editing, you can create entire editorial series with consistent characters. Provide clothing items and a scene description — FLUX.2 generates a coherent model across every shot.
    - 8 images, one prompt: Create a complete fashion editorial with consistent characters across every scene

- Character placed in new scene
Place a character from one image into a completely different setting while preserving their appearance and style.

`The couple from Image 2 is now standing in the middle of the street of Image 1, holding the same object. Apply the style of Image 1 to them as well, make them blend in a smooth way into the image, keep image 1 colors.`

- Season and outfit change — same character
Change the environment, weather, and clothing while keeping the character’s identity intact.

`Keep the woman's pose unchanged. It is now heavily snowing, the background is white and the trees are bare. Snowflakes are visible falling in the frame. The woman is wearing a black coat, and the umbrella is a yellowish-green color`

- Insert the Person Into a Scene
Inserting a person into a scene with FLUX editing

FLUX.2 can populate empty spaces with realistic people — adding visitors to restaurants, students to classrooms, or individuals into architectural scenes. Describe the people, their actions, and how they interact with the environment.

- Multi-Image Referencing and Compositing
Multi-image referencing and compositing with FLUX editing

FLUX.2 supports up to 8 reference images, enabling powerful compositing workflows. Combine people, objects, and backgrounds from different sources into a single coherent scene. Reference each image by number in your prompt.

Refer to each input as “image 1”, “image 2”, etc. in your prompt. Be explicit about which element comes from which image.

Examples:
- Three-image scene composition
`Take the coffee liquid and texture from image 2 and fill the bathtub from image 1 with it. Then place the person from image 3 inside the bath, fully clothed, positioned naturally, and sipping from his cup of coffee.`
- Style-matched couple placement
`The couple from Image 2 is now standing in the middle of the street of Image 1, holding the same object. Apply the style of Image 1 to them as well, make them blend in a smooth way into the image, keep image 1 colors.`
- People + background merge
`Place the people from image 1 and image 2 posing together, and set them over the background from image 3. Match lighting, shadows, scale, and perspective so they look naturally in the same scene.`
- Mix-and-match outfit from multiple images
`Medium shot of a young woman walking down an urban street, wearing the shoes from image 1, the jeans from image 2, and the knit sweater from image 3. Shallow depth of field with the focus on her. Warm, strong sunlight illuminating her.`
- Style transfer + object compositing
`Use image 1 as the base scene. Take the drink from image 3 and place it next to the animal in image 1, matching the lighting, scale, and shadows. Render the entire final image in the art style of image 2, keeping consistent colors, textures, and visual aesthetic.`
- Fantasy compositing — snow globe
`Place the woman from image 1 inside the snow globe from image 2. Add the trees from image 3 inside the snow globe as well, arranged naturally around her.`

- Pose & Layout Guidance
Use reference images to control pose, composition, and spatial layout in FLUX

Pose and layout guidance provides structural control for image generation — using references like poses, depth maps, or edge outlines to control the composition and layout of your output. With FLUX.2, structural control is achieved through reference images and prompt instructions, giving you precise control over positioning, body language, and spatial arrangement.

How Structural Guidance Works in FLUX.2

Instead of dedicated ControlNet inputs, FLUX.2 uses its multi-reference editing system to achieve structural control. You provide a reference image that shows the desired structure (a pose, a layout, or a spatial arrangement) and describe how to apply it in your prompt.

FLUX.2 supports up to 8 reference images. You can combine a structural reference (for pose or layout) with other references (for style, character identity, or objects) in a single generation.

Pose Guidance
The most common form of structural control is pose guidance — using a reference image to dictate body position, gaze direction, and limb placement.
​

Example: Match a pose from a reference image
Upload a pose reference image and FLUX.2 matches it precisely — perfect for maintaining consistency across shots or recreating specific poses.

Prompting for Pose Transfer
Describe which image provides the pose and which provides the character or scene:
`Match the exact pose from image 2 — same arm position, same body angle, same gaze direction. Use the person and clothing from image 1.`

Tips for Pose Guidance:
- Use clear pose references: Simple poses with visible limbs work best. Avoid heavily occluded or ambiguous poses.
- Be specific about what to match: Instead of “use the pose from image 2”, say “match the arm position, stance, and head tilt from image 2”.
- Combine with identity preservation: Pair pose guidance with character consistency by explicitly referencing both the pose source and identity source.
​
Layout and Composition Control
Beyond poses, you can use reference images to guide the overall spatial arrangement of a scene.
​
Example: Collage-based layout control
You can use a single collage image to guide the spatial composition of your output. Arrange reference elements in a collage and FLUX.2 interprets the layout.

`Create a cinematic street scene in front of the pastel-colored corner building. The man in the dark suit is leaning against the wall near the café entrance. The woman is walking past him, carrying one of the Azzedine Alaïa tote bags. The focus is on their contrasting styles — her relaxed, creative vibe versus his confident, formal look. The black boots are part of her outfit`

Quality may be slightly lower with the collage method compared to using multiple separate input images. For best results, use individual reference images when possible.

Example: Multi-reference structural composition
Combine structural elements from multiple references — each image contributes a specific piece (shoes, clothing, accessories) and FLUX.2 assembles them into a coherent result.

`Medium shot of a young woman walking down an urban street, wearing the shoes from image 1, the jeans from image 2, and the knit sweater from image 3. Shallow depth of field with the focus on her. Warm, strong sunlight illuminating her.`

Scene Layout: `Use the spatial layout from image 1 — same composition, same positioning of elements. Replace all objects with futuristic sci-fi versions while keeping the arrangement identical.` 

Architectural and Interior Guidance: `Keep the room layout and furniture positioning from image 1. Change the style to mid-century modern with warm wood tones and brass fixtures.`

Common Prompt Patterns

Pose Transfer with Style Change: `The person from image 1 in the exact pose from image 2. Apply a cinematic film noir style — high contrast black and white, dramatic side lighting, deep shadows.`

Pose Transfer with Scene Change: `Place the person from image 1 into a sun-drenched Mediterranean terrace. Match the standing pose from image 2 exactly — same weight distribution, same arm position.`

Layout Preservation with Content Swap: `Keep the exact spatial arrangement from image 1. Replace the person with a robot, the chair with a hovering platform, and the window view with a cityscape. Maintain all proportions and positioning.`

Multi-Reference Structural Control: `Use the pose from image 1, the clothing from image 2, the face from image 3, and the background from image 4. Combine them into a single coherent fashion editorial shot.`

Best Practices

Do:
- Use clean, uncluttered reference images for structural guidance
- Explicitly state which image provides the structure vs. content
- Combine structural references with style or identity references
- Be specific about which structural elements to preserve (pose, layout, depth)

Avoid:
- Using ambiguous or low-quality pose references
- Expecting pixel-perfect structural matching — FLUX.2 interprets structure semantically
- Overloading the prompt with too many structural constraints at once
- Forgetting to reference images by number in your prompt
