import { roundDownToMultiple } from 'common/util/roundDownToMultiple';
import type { RootState } from 'app/store/store';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import type { Graph } from 'features/nodes/util/graph/generation/Graph';
import type { Invocation } from 'services/api/types';
import { selectMrFlowHighResSteps, selectMrFlowLowResSteps, selectMrFlowSigma } from 'features/controlLayers/store/paramsSlice';

type AddMrFlowArg = {
  g: Graph;
  state: RootState;
  denoise: Invocation<'flux_denoise' | 'flux2_denoise' | 'qwen_image_denoise'>;
  modelLoader: Invocation<'flux_model_loader' | 'flux2_klein_model_loader' | 'qwen_image_model_loader'>;
  l2i: Invocation<'flux_vae_decode' | 'flux2_vae_decode' | 'pid_decode' | 'qwen_image_l2i'>;
  isFlux2?: boolean;
  isQwenImage?: boolean;
};

export const addMrFlow = ({
  g,
  state,
  denoise,
  modelLoader,
  l2i,
  isFlux2,
  isQwenImage,
}: AddMrFlowArg): {
  highResDenoise: Invocation<'flux_denoise' | 'flux2_denoise' | 'qwen_image_denoise'>;
  highResL2i: Invocation<'flux_vae_decode' | 'flux2_vae_decode' | 'pid_decode' | 'qwen_image_l2i'>;
} => {
  const lowResSteps = selectMrFlowLowResSteps(state);
  const highResSteps = selectMrFlowHighResSteps(state);
  const sigma = selectMrFlowSigma(state);

  const { width, height } = state.params.dimensions;
  
  denoise.width = roundDownToMultiple(width / 2, 16);
  denoise.height = roundDownToMultiple(height / 2, 16);
  if (isQwenImage) {
    (denoise as any).steps = lowResSteps;
  } else {
    (denoise as any).num_steps = lowResSteps;
  }

  const upscale = g.addNode({
    type: 'esrgan',
    id: getPrefixedId('mrflow_upscale'),
    model_name: 'RealESRGAN_x2plus.pth',
  } as Invocation<'esrgan'>);
  g.addEdgeFromObj({
    source: { node_id: l2i.id, field: 'image' },
    destination: { node_id: upscale.id, field: 'image' },
  });

  let vaeEncodeType = 'flux_vae_encode';
  if (isQwenImage) {
    vaeEncodeType = 'qwen_image_i2l';
  } else if (isFlux2) {
    vaeEncodeType = 'flux2_vae_encode';
  }

  const vaeEncode = g.addNode({
    type: vaeEncodeType,
    id: getPrefixedId('mrflow_vae_encode'),
  } as Invocation<'flux_vae_encode' | 'flux2_vae_encode' | 'qwen_image_i2l'>);
  g.addEdgeFromObj({
    source: { node_id: upscale.id, field: 'image' },
    destination: { node_id: vaeEncode.id, field: 'image' },
  });
  
  if (isFlux2) {
    g.addEdgeFromObj({
      source: { node_id: modelLoader.id, field: 'vae' },
      destination: { node_id: vaeEncode.id, field: 'vae' },
    });
  } else if (isQwenImage) {
    g.addEdgeFromObj({
      source: { node_id: modelLoader.id, field: 'vae' },
      destination: { node_id: vaeEncode.id, field: 'vae' },
    });
  } else {
    g.addEdgeFromObj({
      source: { node_id: modelLoader.id, field: 'vae' },
      destination: { node_id: vaeEncode.id, field: 'vae' },
    });
  }

  const highResDenoise = g.addNode({
    ...denoise,
    id: getPrefixedId('mrflow_high_res_denoise'),
    denoising_start: sigma,
    denoising_end: 1.0,
    add_noise: true,
  } as Invocation<'flux_denoise' | 'flux2_denoise' | 'qwen_image_denoise'>);

  if (isQwenImage) {
    (highResDenoise as any).steps = highResSteps;
  } else {
    (highResDenoise as any).num_steps = highResSteps;
  }

  g.addEdgeFromObj({
    source: { node_id: vaeEncode.id, field: 'latents' },
    destination: { node_id: highResDenoise.id, field: 'latents' },
  });

  const edges = g.getEdges();
  for (const edge of edges) {
    if (edge.destination.node_id === denoise.id && edge.destination.field !== 'latents' && edge.destination.field !== 'seed') {
      g.addEdgeFromObj({
        source: { node_id: edge.source.node_id, field: edge.source.field },
        destination: { node_id: highResDenoise.id, field: edge.destination.field }
      });
    }
  }

  // Ensure seed is copied from the original state to avoid exact same noise injection?
  // Wait, if it has the same seed, it will inject deterministic noise, which is fine!
  // But wait, the original denoise node has the seed connected.
  for (const edge of edges) {
    if (edge.destination.node_id === denoise.id && edge.destination.field === 'seed') {
      g.addEdgeFromObj({
        source: { node_id: edge.source.node_id, field: edge.source.field },
        destination: { node_id: highResDenoise.id, field: edge.destination.field }
      });
    }
  }

  const highResL2i = g.addNode({
    ...l2i,
    id: getPrefixedId('mrflow_high_res_l2i'),
  } as Invocation<'flux_vae_decode' | 'flux2_vae_decode' | 'pid_decode' | 'qwen_image_l2i'>);

  g.addEdgeFromObj({
    source: { node_id: highResDenoise.id, field: 'latents' },
    destination: { node_id: highResL2i.id, field: 'latents' },
  });

  // Duplicate edges to l2i for VAE, etc.
  for (const edge of edges) {
    if (edge.destination.node_id === l2i.id && edge.destination.field !== 'latents') {
      g.addEdgeFromObj({
        source: { node_id: edge.source.node_id, field: edge.source.field },
        destination: { node_id: highResL2i.id, field: edge.destination.field }
      });
    }
  }

  // Connect VAE to the final decode node (only for QwenImage if we didn't duplicate it. Actually, the duplication loop above already handles it!)
  // Wait, I didn't duplicate the VAE edge to vaeEncode. Wait, the loop above duplicates edges to l2i, which is the VAE decode node.
  // The earlier manual VAE connection to l2i might not be needed if the loop does it, but I'll keep it just in case. Wait, I manually added VAE to `vaeEncode`, not `highResL2i`.
  // Wait, my original code didn't duplicate VAE to highResL2i manually? Oh it did.
  // Actually, I don't need manual VAE connection if the loop duplicates all non-latents edges to l2i! Let's just rely on the loop.

  return { highResDenoise, highResL2i };
};
