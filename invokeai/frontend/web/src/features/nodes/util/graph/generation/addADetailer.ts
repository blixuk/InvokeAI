import type { RootState } from 'app/store/store';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import type { Graph } from 'features/nodes/util/graph/generation/Graph';
import { selectModelConfigsQuery } from 'services/api/endpoints/models';
import type { AnyInvocation } from 'services/api/types';

type AddADetailerArg = {
  g: Graph;
  state: RootState;
  imageOutput: AnyInvocation;
  modelLoader: AnyInvocation;
  vaeSource: AnyInvocation;
  seed: AnyInvocation;
  posCond: AnyInvocation;
  negCond: AnyInvocation | null;
};

export const addADetailer = (arg: AddADetailerArg): any => {
  const { g, state, imageOutput, modelLoader, vaeSource, seed, posCond, negCond } = arg;
  const adetailer = state.adetailer;

  if (!adetailer.isEnabled) {
    return imageOutput;
  }

  const addEdge = (fromNode: AnyInvocation, fromField: string, toNode: AnyInvocation, toField: string) => {
    (g as any).addEdge(fromNode, fromField, toNode, toField);
  };

  // If user wants a side-by-side comparison, save the base generated image to the gallery as the 'before' image.
  if (adetailer.saveBeforeImage) {
    imageOutput.is_intermediate = false;
  }

  const isFlux = modelLoader.type === 'flux_model_loader' || modelLoader.type === 'flux2_klein_model_loader';

  let detailerModelLoader: AnyInvocation = modelLoader;
  let detailerVaeSource: AnyInvocation = vaeSource;
  let detailerPosCond: AnyInvocation = posCond;
  let detailerNegCond: AnyInvocation | null = negCond;
  let detailerModelConfig: unknown = null;

  if (isFlux) {
    // 0. Resolve available SDXL or SD1.5 models for the detailing step
    const modelsQuery = selectModelConfigsQuery(state);
    const allModels = modelsQuery.data ? Object.values(modelsQuery.data.entities) : [];
    
    // Prefer SDXL (since FLUX generates at 1024x1024), fall back to SD-1
    detailerModelConfig = allModels.find(
      (m) => m && m.type === 'main' && m.base === 'sdxl'
    ) || allModels.find(
      (m) => m && m.type === 'main' && m.base === 'sd-1'
    );

    if (detailerModelConfig) {
      const config = detailerModelConfig as {
        key: string;
        hash: string;
        name: string;
        base: 'sdxl' | 'sd-1';
        type: 'main';
      };
      const loader = g.addNode({
        type: config.base === 'sdxl' ? 'sdxl_model_loader' : 'main_model_loader',
        id: getPrefixedId('adetailer_model_loader'),
        model: {
          key: config.key,
          hash: config.hash,
          name: config.name,
          base: config.base,
          type: config.type,
        },
      });

      detailerModelLoader = loader;
      detailerVaeSource = loader;

      const isSDXL = config.base === 'sdxl';
      if (isSDXL) {
        const customPosCond = g.addNode({
          type: 'sdxl_compel_prompt',
          id: getPrefixedId('adetailer_pos_cond'),
          prompt: adetailer.prompt || state.params.positivePrompt,
          style: adetailer.prompt || state.params.positivePrompt,
        });
        addEdge(loader, 'clip', customPosCond, 'clip');
        addEdge(loader, 'clip2', customPosCond, 'clip2');

        const customPosCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_pos_cond_collect'),
        });
        addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
        detailerPosCond = customPosCondCollect;

        const customNegCond = g.addNode({
          type: 'sdxl_compel_prompt',
          id: getPrefixedId('adetailer_neg_cond'),
          prompt: state.params.negativePrompt || '',
          style: state.params.negativePrompt || '',
        });
        addEdge(loader, 'clip', customNegCond, 'clip');
        addEdge(loader, 'clip2', customNegCond, 'clip2');

        const customNegCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_neg_cond_collect'),
        });
        addEdge(customNegCond, 'conditioning', customNegCondCollect, 'item');
        detailerNegCond = customNegCondCollect;
      } else {
        // SD1.5
        const customPosCond = g.addNode({
          type: 'compel',
          id: getPrefixedId('adetailer_pos_cond'),
          prompt: adetailer.prompt || state.params.positivePrompt,
        });
        addEdge(loader, 'clip', customPosCond, 'clip');

        const customPosCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_pos_cond_collect'),
        });
        addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
        detailerPosCond = customPosCondCollect;

        const customNegCond = g.addNode({
          type: 'compel',
          id: getPrefixedId('adetailer_neg_cond'),
          prompt: state.params.negativePrompt || '',
        });
        addEdge(loader, 'clip', customNegCond, 'clip');

        const customNegCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_neg_cond_collect'),
        });
        addEdge(customNegCond, 'conditioning', customNegCondCollect, 'item');
        detailerNegCond = customNegCondCollect;
      }
    }
  }

  // 1. Create FaceOff node (handles MediaPipe face detection, crop and masking)
  const faceOff = g.addNode({
    type: 'face_off',
    id: getPrefixedId('adetailer_face_off'),
    minimum_confidence: adetailer.minConfidence,
    padding: adetailer.padding,
    chunk: false,
  });
  addEdge(imageOutput, 'image', faceOff, 'image');

  // 2. Create Denoise Mask node
  const createDenoiseMask = g.addNode({
    type: 'create_denoise_mask',
    id: getPrefixedId('adetailer_denoise_mask'),
    fp32: true,
  });
  addEdge(detailerVaeSource, 'vae', createDenoiseMask, 'vae');
  addEdge(faceOff, 'image', createDenoiseMask, 'image');
  addEdge(faceOff, 'mask', createDenoiseMask, 'mask');

  // 3. Create Image to Latents (i2l) node for the face crop
  const i2l = g.addNode({
    type: 'i2l',
    id: getPrefixedId('adetailer_i2l'),
    fp32: true,
  });
  addEdge(detailerVaeSource, 'vae', i2l, 'vae');
  addEdge(faceOff, 'image', i2l, 'image');

  // 4. Create Noise node matched to face crop dimensions
  const noise = g.addNode({
    type: 'noise',
    id: getPrefixedId('adetailer_noise'),
    use_cpu: state.params.shouldUseCpuNoise,
  });
  addEdge(seed, 'value', noise, 'seed');
  addEdge(faceOff, 'width', noise, 'width');
  addEdge(faceOff, 'height', noise, 'height');

  // 5. Handle custom detailing prompt overrides
  let adetailerPosCond = detailerPosCond;
  if (adetailer.prompt.trim() !== '') {
    const isSDXL = detailerModelLoader.type === 'sdxl_model_loader' || (isFlux && detailerModelConfig && (detailerModelConfig as { base: string }).base === 'sdxl');
    if (isSDXL) {
      const customPosCond = g.addNode({
        type: 'sdxl_compel_prompt',
        id: getPrefixedId('adetailer_pos_cond'),
        prompt: adetailer.prompt,
        style: adetailer.prompt,
      });
      addEdge(detailerModelLoader, 'clip', customPosCond, 'clip');
      addEdge(detailerModelLoader, 'clip2', customPosCond, 'clip2');

      const customPosCondCollect = g.addNode({
        type: 'collect',
        id: getPrefixedId('adetailer_pos_cond_collect'),
      });
      addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
      adetailerPosCond = customPosCondCollect;
    } else {
      // SD1.5 fallback
      const customPosCond = g.addNode({
        type: 'compel',
        id: getPrefixedId('adetailer_pos_cond'),
        prompt: adetailer.prompt,
      });
      addEdge(detailerModelLoader, 'clip', customPosCond, 'clip');

      const customPosCondCollect = g.addNode({
        type: 'collect',
        id: getPrefixedId('adetailer_pos_cond_collect'),
      });
      addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
      adetailerPosCond = customPosCondCollect;
    }
  }

  // 6. Create Sampler/Denoise Latents node for detailing
  const denoise = g.addNode({
    type: 'denoise_latents',
    id: getPrefixedId('adetailer_denoise'),
    cfg_scale: state.params.cfgScale,
    scheduler: state.params.scheduler,
    steps: state.params.steps,
    denoising_start: 1 - adetailer.denoisingStrength,
    denoising_end: 1.0,
  });

  addEdge(detailerModelLoader, 'unet', denoise, 'unet');
  addEdge(i2l, 'latents', denoise, 'latents');
  addEdge(noise, 'noise', denoise, 'noise');
  addEdge(createDenoiseMask, 'denoise_mask', denoise, 'denoise_mask');

  // Wire conditioning to denoise
  if (adetailerPosCond.type === 'collect') {
    addEdge(adetailerPosCond, 'collection', denoise, 'positive_conditioning');
  } else {
    addEdge(adetailerPosCond, 'conditioning', denoise, 'positive_conditioning');
  }
  
  if (detailerNegCond) {
    if (detailerNegCond.type === 'collect') {
      addEdge(detailerNegCond, 'collection', denoise, 'negative_conditioning');
    } else {
      addEdge(detailerNegCond, 'conditioning', denoise, 'negative_conditioning');
    }
  }

  // 7. Create Latents to Image (l2i) node to decode detailed face
  const l2i = g.addNode({
    type: 'l2i',
    id: getPrefixedId('adetailer_l2i'),
    fp32: true,
  });
  addEdge(detailerVaeSource, 'vae', l2i, 'vae');
  addEdge(denoise, 'latents', l2i, 'latents');

  let pasteMask: AnyInvocation = faceOff;
  let pasteMaskField = 'mask';

  if (adetailer.maskBlur > 0) {
    const blurMask = g.addNode({
      type: 'img_blur',
      id: getPrefixedId('adetailer_mask_blur'),
      radius: adetailer.maskBlur,
      blur_type: 'gaussian',
    });
    addEdge(faceOff, 'mask', blurMask, 'image');
    pasteMask = blurMask;
    pasteMaskField = 'image';
  }

  // 8. Create Paste node to alpha blend detailed face back on base image
  const paste = g.addNode({
    type: 'img_paste',
    id: getPrefixedId('adetailer_paste'),
    crop: true,
  });
  addEdge(imageOutput, 'image', paste, 'base_image');
  addEdge(l2i, 'image', paste, 'image');
  addEdge(pasteMask, pasteMaskField, paste, 'mask');
  addEdge(faceOff, 'x', paste, 'x');
  addEdge(faceOff, 'y', paste, 'y');

  // Return the final blended image node to complete the pipeline
  return paste;
};
