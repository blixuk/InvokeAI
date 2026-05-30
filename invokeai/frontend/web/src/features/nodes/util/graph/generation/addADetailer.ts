import type { RootState } from 'app/store/store';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import type { Graph } from 'features/nodes/util/graph/generation/Graph';
import type { ImageOutputNodes, MainModelLoaderNodes, VaeSourceNodes } from 'features/nodes/util/graph/types';
import { selectModelConfigsQuery } from 'services/api/endpoints/models';
import type { Invocation } from 'services/api/types';

type AddADetailerArg = {
  g: Graph;
  state: RootState;
  imageOutput: Invocation<ImageOutputNodes>;
  modelLoader: Invocation<MainModelLoaderNodes>;
  vaeSource: Invocation<VaeSourceNodes | MainModelLoaderNodes>;
  seed: Invocation<'integer'>;
  posCond: Invocation<unknown>;
  negCond: Invocation<unknown> | null;
};

export const addADetailer = (arg: AddADetailerArg): Invocation<ImageOutputNodes> => {
  const { g, state, imageOutput, modelLoader, vaeSource, seed, posCond, negCond } = arg;
  const adetailer = state.adetailer;

  if (!adetailer.isEnabled) {
    return imageOutput;
  }

  // If user wants a side-by-side comparison, save the base generated image to the gallery as the 'before' image.
  if (adetailer.saveBeforeImage) {
    // @ts-expect-error - imageOutput is type-safe but node updates are generic
    g.updateNode(imageOutput, { is_intermediate: false });
  }

  const isFlux = modelLoader.type === 'flux_model_loader' || modelLoader.type === 'flux2_klein_model_loader';

  let detailerModelLoader: Invocation<MainModelLoaderNodes> = modelLoader;
  let detailerVaeSource: Invocation<VaeSourceNodes | MainModelLoaderNodes> = vaeSource;
  let detailerPosCond: Invocation<unknown> = posCond;
  let detailerNegCond: Invocation<unknown> | null = negCond;
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

      detailerModelLoader = loader as unknown as Invocation<MainModelLoaderNodes>;
      detailerVaeSource = loader as unknown as Invocation<MainModelLoaderNodes>;

      const isSDXL = config.base === 'sdxl';
      if (isSDXL) {
        const customPosCond = g.addNode({
          type: 'sdxl_compel_prompt',
          id: getPrefixedId('adetailer_pos_cond'),
          prompt: adetailer.prompt || state.params.prompt,
          style: adetailer.prompt || state.params.prompt,
        });
        g.addEdge(loader, 'clip', customPosCond, 'clip');
        g.addEdge(loader, 'clip2', customPosCond, 'clip2');

        const customPosCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_pos_cond_collect'),
        });
        g.addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
        detailerPosCond = customPosCondCollect as unknown as Invocation<unknown>;

        const customNegCond = g.addNode({
          type: 'sdxl_compel_prompt',
          id: getPrefixedId('adetailer_neg_cond'),
          prompt: state.params.negativePrompt || '',
          style: state.params.negativePrompt || '',
        });
        g.addEdge(loader, 'clip', customNegCond, 'clip');
        g.addEdge(loader, 'clip2', customNegCond, 'clip2');

        const customNegCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_neg_cond_collect'),
        });
        g.addEdge(customNegCond, 'conditioning', customNegCondCollect, 'item');
        detailerNegCond = customNegCondCollect as unknown as Invocation<unknown>;
      } else {
        // SD1.5
        const customPosCond = g.addNode({
          type: 'compel',
          id: getPrefixedId('adetailer_pos_cond'),
          prompt: adetailer.prompt || state.params.prompt,
        });
        g.addEdge(loader, 'clip', customPosCond, 'clip');

        const customPosCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_pos_cond_collect'),
        });
        g.addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
        detailerPosCond = customPosCondCollect as unknown as Invocation<unknown>;

        const customNegCond = g.addNode({
          type: 'compel',
          id: getPrefixedId('adetailer_neg_cond'),
          prompt: state.params.negativePrompt || '',
        });
        g.addEdge(loader, 'clip', customNegCond, 'clip');

        const customNegCondCollect = g.addNode({
          type: 'collect',
          id: getPrefixedId('adetailer_neg_cond_collect'),
        });
        g.addEdge(customNegCond, 'conditioning', customNegCondCollect, 'item');
        detailerNegCond = customNegCondCollect as unknown as Invocation<unknown>;
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
  // @ts-expect-error - imageOutput outputs image but node connections are loose
  g.addEdge(imageOutput, 'image', faceOff, 'image');

  // 2. Create Denoise Mask node
  const createDenoiseMask = g.addNode({
    type: 'create_denoise_mask',
    id: getPrefixedId('adetailer_denoise_mask'),
    fp32: true,
  });
  // @ts-expect-error - detailerVaeSource is generic
  g.addEdge(detailerVaeSource, 'vae', createDenoiseMask, 'vae');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'image', createDenoiseMask, 'image');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'mask', createDenoiseMask, 'mask');

  // 3. Create Image to Latents (i2l) node for the face crop
  const i2l = g.addNode({
    type: 'i2l',
    id: getPrefixedId('adetailer_i2l'),
    fp32: true,
  });
  // @ts-expect-error - detailerVaeSource is generic
  g.addEdge(detailerVaeSource, 'vae', i2l, 'vae');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'image', i2l, 'image');

  // 4. Create Noise node matched to face crop dimensions
  const noise = g.addNode({
    type: 'noise',
    id: getPrefixedId('adetailer_noise'),
    use_cpu: state.params.shouldUseCpuNoise,
  });
  // @ts-expect-error - seed is generic
  g.addEdge(seed, 'value', noise, 'seed');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'width', noise, 'width');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'height', noise, 'height');

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
      // @ts-expect-error - loader is generic
      g.addEdge(detailerModelLoader, 'clip', customPosCond, 'clip');
      // @ts-expect-error - loader is generic
      g.addEdge(detailerModelLoader, 'clip2', customPosCond, 'clip2');

      const customPosCondCollect = g.addNode({
        type: 'collect',
        id: getPrefixedId('adetailer_pos_cond_collect'),
      });
      // @ts-expect-error - customPosCond is generic
      g.addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
      adetailerPosCond = customPosCondCollect as unknown as Invocation<unknown>;
    } else {
      // SD1.5 fallback
      const customPosCond = g.addNode({
        type: 'compel',
        id: getPrefixedId('adetailer_pos_cond'),
        prompt: adetailer.prompt,
      });
      // @ts-expect-error - loader is generic
      g.addEdge(detailerModelLoader, 'clip', customPosCond, 'clip');

      const customPosCondCollect = g.addNode({
        type: 'collect',
        id: getPrefixedId('adetailer_pos_cond_collect'),
      });
      // @ts-expect-error - customPosCond is generic
      g.addEdge(customPosCond, 'conditioning', customPosCondCollect, 'item');
      adetailerPosCond = customPosCondCollect as unknown as Invocation<unknown>;
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

  // @ts-expect-error - loader is generic
  g.addEdge(detailerModelLoader, 'unet', denoise, 'unet');
  // @ts-expect-error - i2l is generic
  g.addEdge(i2l, 'latents', denoise, 'latents');
  // @ts-expect-error - noise is generic
  g.addEdge(noise, 'noise', denoise, 'noise');
  // @ts-expect-error - createDenoiseMask is generic
  g.addEdge(createDenoiseMask, 'denoise_mask', denoise, 'denoise_mask');

  // Wire conditioning to denoise
  // @ts-expect-error - adetailerPosCond is generic
  if (adetailerPosCond.type === 'collect') {
    // @ts-expect-error - adetailerPosCond is generic
    g.addEdge(adetailerPosCond, 'collection', denoise, 'positive_conditioning');
  } else {
    // @ts-expect-error - adetailerPosCond is generic
    g.addEdge(adetailerPosCond, 'conditioning', denoise, 'positive_conditioning');
  }
  
  if (detailerNegCond) {
    // @ts-expect-error - detailerNegCond is generic
    if (detailerNegCond.type === 'collect') {
      // @ts-expect-error - detailerNegCond is generic
      g.addEdge(detailerNegCond, 'collection', denoise, 'negative_conditioning');
    } else {
      // @ts-expect-error - detailerNegCond is generic
      g.addEdge(detailerNegCond, 'conditioning', denoise, 'negative_conditioning');
    }
  }

  // 7. Create Latents to Image (l2i) node to decode detailed face
  const l2i = g.addNode({
    type: 'l2i',
    id: getPrefixedId('adetailer_l2i'),
    fp32: true,
  });
  // @ts-expect-error - detailerVaeSource is generic
  g.addEdge(detailerVaeSource, 'vae', l2i, 'vae');
  // @ts-expect-error - denoise is generic
  g.addEdge(denoise, 'latents', l2i, 'latents');

  // 8. Create Paste node to alpha blend detailed face back on base image
  const paste = g.addNode({
    type: 'img_paste',
    id: getPrefixedId('adetailer_paste'),
    crop: true,
  });
  // @ts-expect-error - imageOutput is generic
  g.addEdge(imageOutput, 'image', paste, 'base_image');
  // @ts-expect-error - l2i is generic
  g.addEdge(l2i, 'image', paste, 'image');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'mask', paste, 'mask');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'x', paste, 'x');
  // @ts-expect-error - faceOff is generic
  g.addEdge(faceOff, 'y', paste, 'y');

  // Return the final blended image node to complete the pipeline
  return paste as unknown as Invocation<ImageOutputNodes>;
};
