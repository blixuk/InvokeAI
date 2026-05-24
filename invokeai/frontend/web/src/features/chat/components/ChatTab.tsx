import { Box, Button, Combobox, Flex, FormControl, FormLabel, IconButton, Image, Spinner,Switch, Text, Textarea } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppDispatch,useAppSelector } from 'app/store/storeHooks';
import { useClipboard } from 'common/hooks/useClipboard';
import { $activeModel, $chatHistory, $chatImages, $chatInput, $chatMode } from 'features/chat/store/chatStore';
import { controlLayerAdded } from 'features/controlLayers/store/canvasSlice';
import { loraAdded } from 'features/controlLayers/store/lorasSlice';
import { 
  heightChanged,
  negativePromptChanged,
  positivePromptChanged,
  selectBase, 
  selectModel,
  selectModelConfig,
  selectParamsSlice,
  setCfgScale,
  setSeed,
  setSteps,
  widthChanged} from 'features/controlLayers/store/paramsSlice';
import { refImageAdded } from 'features/controlLayers/store/refImagesSlice';
import { selectAllEntities, selectCanvasSlice } from 'features/controlLayers/store/selectors';
import { initialControlNet, initialIPAdapter } from 'features/controlLayers/store/util';
import { addImageToChatDndTarget } from 'features/dnd/dnd';
import { DndDropTarget } from 'features/dnd/DndDropTarget';
import { useEnqueueGenerate } from 'features/queue/hooks/useEnqueueGenerate';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiCheckBold,PiCopyBold, PiPaperPlaneRightFill, PiTrashBold, PiXBold } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useListChatModelsQuery } from 'services/api/endpoints/chat';
import { imagesApi, useGetImageDTOQuery } from 'services/api/endpoints/images';
import { useControlNetModels, useGlobalReferenceImageModels, useLoRAModels } from 'services/api/hooks/modelsByType';
import { v4 as uuidv4 } from 'uuid';

const ChatImagePreview = memo(({ imageName }: { imageName: string }) => {
  const { currentData: imageDTO } = useGetImageDTOQuery(imageName);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!imageDTO) {
    return (
      <Text fontSize="xs" color="base.300" mt={2}>
        Loading image...
      </Text>
    );
  }

  return (
    <Box mt={2} cursor="pointer" onClick={toggleExpanded}>
      <Image
        src={isExpanded ? imageDTO.image_url : imageDTO.thumbnail_url}
        maxW={isExpanded ? '100%' : '128px'}
        borderRadius="md"
        transition="all 0.2s"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="base.800"
      />
    </Box>
  );
});

ChatImagePreview.displayName = 'ChatImagePreview';

 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSetupWorkflow = (controlNetModels: any[], ipAdapterModels: any[], loraModels: any[], currentBase: any) => {
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useCallback(async (args: any, images?: string[]) => {
    if (args.positive_prompt) {
      dispatch(positivePromptChanged(args.positive_prompt));
    }
    
    if (args.control_layers && Array.isArray(args.control_layers)) {
      for (let i = 0; i < args.control_layers.length; i++) {
        const layer = args.control_layers[i];
        // AI sometimes hallucinates layer.type === 'control_layers' because of the property name.
        // We can check model_type or use includes.
        const isControlNet = layer.type === 'controlnet' || (layer.model_type && ['openpose', 'canny', 'depth', 'controlnet'].some((t: string) => layer.model_type.toLowerCase().includes(t)));

        let imageRef = null;
        if (images && images[i]) {
           try {
             const imageDTO = await dispatch(imagesApi.endpoints.getImageDTO.initiate(images[i])).unwrap();
             imageRef = {
               image_name: imageDTO.image_name,
               width: imageDTO.width,
               height: imageDTO.height
             };
           } catch (e) {
             // eslint-disable-next-line no-console
             console.error("Failed to load imageDTO for advanced workflow", e);
           }
        }

        if (isControlNet) {
          const modelType = layer.model_type?.toLowerCase() || '';
          let matchedModel = controlNetModels.find((m) => m.base === currentBase && m.name.toLowerCase().includes(modelType));
          if (!matchedModel && controlNetModels.length > 0) {
             matchedModel = controlNetModels.find((m) => m.base === currentBase);
          }

          dispatch(controlLayerAdded({
            overrides: {
              isEnabled: true,
              name: layer.model_type || 'ControlNet',
              objects: imageRef ? [{
                id: `image_${uuidv4()}`,
                type: 'image',
                image: imageRef,
              }] : [],
              controlAdapter: {
                ...initialControlNet,
                type: 'controlnet',
                model: matchedModel ? {
                  key: matchedModel.key,
                  hash: matchedModel.hash,
                  name: matchedModel.name,
                  base: matchedModel.base,
                  type: matchedModel.type
                } : null,
              }
            }
          }));
        } else {
          let matchedModel = ipAdapterModels.find((m) => m.base === currentBase);

          dispatch(refImageAdded({
            overrides: {
              isEnabled: true,
              config: {
                ...initialIPAdapter,
                type: 'ip_adapter',
                image: imageRef ? { original: { image: imageRef } } : null,
                model: matchedModel ? {
                  key: matchedModel.key,
                  hash: matchedModel.hash,
                  name: matchedModel.name,
                  base: matchedModel.base,
                  type: matchedModel.type
                } : null,
              }
            }
          }));
        }
      }
    }

    if (args.loras && Array.isArray(args.loras)) {
      args.loras.forEach((loraName: string) => {
        const matchedLora = loraModels.find((m) => m.base === currentBase && m.name.toLowerCase().includes(loraName.toLowerCase()));
        if (matchedLora) {
          dispatch(loraAdded({ model: matchedLora }));
        }
      });
    }
  }, [dispatch, controlNetModels, ipAdapterModels, loraModels, currentBase]);
};

const ChatInputImagePreview = memo(({ imageName, onRemove }: { imageName: string, onRemove: (name: string) => void }) => {
  const { currentData: imageDTO } = useGetImageDTOQuery(imageName);
  
  const handleRemove = useCallback(() => {
    onRemove(imageName);
  }, [imageName, onRemove]);

  if (!imageDTO) {
return null;
}

  return (
    <Flex alignItems="center" gap={2} bg="base.700" p={2} borderRadius="md" w="max-content">
      <Image src={imageDTO.thumbnail_url} w={12} h={12} objectFit="cover" borderRadius="sm" />
      <Text fontSize="sm" color="base.200" maxW="200px" noOfLines={1}>
        {imageDTO.image_name}
      </Text>
      <IconButton
        aria-label="Remove Image"
        icon={<PiXBold />}
        size="sm"
        variant="ghost"
        onClick={handleRemove}
      />
    </Flex>
  );
});
ChatInputImagePreview.displayName = 'ChatInputImagePreview';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChatMessageBubble = memo(({ msg }: { msg: any }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
  const toggleThoughtExpanded = useCallback(() => {
    setIsThoughtExpanded((prev) => !prev);
  }, []);
  const dispatch = useAppDispatch();
  const chatMode = useStore($chatMode);

  const clipboard = useClipboard();

  const handleCopy = useCallback(() => {
    clipboard.copy(msg.content);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [msg.content, clipboard]);

  const invokeBase = useAppSelector(selectBase);
  const [controlNetModels] = useControlNetModels();
  const [ipAdapterModels] = useGlobalReferenceImageModels();
  const [loraModels] = useLoRAModels();
  const handleSetupWorkflow = useSetupWorkflow(controlNetModels, ipAdapterModels, loraModels, invokeBase);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleApplyParams = useCallback((args: any) => {
    if (args.positive_prompt) {
      dispatch(positivePromptChanged(args.positive_prompt));
    }
    if (args.negative_prompt) {
      dispatch(negativePromptChanged(args.negative_prompt));
    }
    if (args.width) {
      dispatch(widthChanged({ width: args.width }));
    }
    if (args.height) {
      dispatch(heightChanged({ height: args.height }));
    }
    if (args.seed !== undefined) {
      dispatch(setSeed(args.seed));
    }
    if (args.steps) {
      dispatch(setSteps(args.steps));
    }
    if (args.cfg_scale) {
      dispatch(setCfgScale(args.cfg_scale));
    }
    if (args.loras && Array.isArray(args.loras)) {
      args.loras.forEach((loraName: string) => {
        const matchedLora = loraModels.find((m) => m.base === invokeBase && m.name.toLowerCase().includes(loraName.toLowerCase()));
        if (matchedLora) {
          dispatch(loraAdded({ model: matchedLora }));
        }
      });
    }
    if (args.generate_now) {
      // Note: in manual apply mode, we don't have access to enqueueBack inside ChatMessageBubble easily without prop drilling.
    }
  }, [dispatch, loraModels, invokeBase]);

  const isUser = msg.role === 'user';

  let displayContent = msg.content || '';
  let thoughtContent = '';

  const channelThoughtStart = '<|channel>thought';
  const channelThoughtEnd = '<channel|>';
  const thinkStart = '<think>';
  const thinkEnd = '</think>';

  if (displayContent.includes(channelThoughtStart)) {
    const startIndex = displayContent.indexOf(channelThoughtStart);
    const endIndex = displayContent.indexOf(channelThoughtEnd);
    
    if (endIndex !== -1) {
      thoughtContent = displayContent.substring(startIndex + channelThoughtStart.length, endIndex).replace(/^\n/, '');
      displayContent = displayContent.substring(0, startIndex) + displayContent.substring(endIndex + channelThoughtEnd.length);
    } else {
      thoughtContent = displayContent.substring(startIndex + channelThoughtStart.length).replace(/^\n/, '');
      displayContent = displayContent.substring(0, startIndex);
    }
  } else if (displayContent.includes(thinkStart)) {
    const startIndex = displayContent.indexOf(thinkStart);
    const endIndex = displayContent.indexOf(thinkEnd);
    
    if (endIndex !== -1) {
      thoughtContent = displayContent.substring(startIndex + thinkStart.length, endIndex).replace(/^\n/, '');
      displayContent = displayContent.substring(0, startIndex) + displayContent.substring(endIndex + thinkEnd.length);
    } else {
      thoughtContent = displayContent.substring(startIndex + thinkStart.length).replace(/^\n/, '');
      displayContent = displayContent.substring(0, startIndex);
    }
  }

  return (
    <Flex w="full" justifyContent={isUser ? 'flex-end' : 'flex-start'} role="group">
      <Box
        maxW="70%"
        p={3}
        borderRadius="md"
        bg={isUser ? 'invokeBlue.700' : 'base.700'}
        color={isUser ? 'white' : 'base.100'}
        position="relative"
      >
        {!isUser && (
          <IconButton
            aria-label="Copy message"
            icon={hasCopied ? <PiCheckBold /> : <PiCopyBold />}
            size="xs"
            position="absolute"
            top={1}
            right={1}
            opacity={0}
            _groupHover={{ opacity: 1 }}
            onClick={handleCopy}
            variant="ghost"
            color="base.300"
            _hover={{ bg: 'base.600', color: 'white' }}
          />
        )}
        <Box mt={isUser ? 0 : 4}>
          {!isUser ? (
            <Flex flexDir="column" gap={2}>
              {thoughtContent && (
                <Box borderLeft="2px solid" borderColor="invokeBlue.500" pl={3} py={1} bg="base.800" borderRadius="md" p={2}>
                  <Flex 
                    justifyContent="space-between" 
                    alignItems="center" 
                    cursor="pointer" 
                    onClick={toggleThoughtExpanded}
                  >
                    <Text fontSize="xs" fontWeight="bold" color="invokeBlue.300" textTransform="uppercase">
                      AI Reasoning
                    </Text>
                    <Text fontSize="xs" color="base.500" fontWeight="bold">
                      {isThoughtExpanded ? 'HIDE' : 'SHOW'}
                    </Text>
                  </Flex>
                  {isThoughtExpanded && (
                    <Box 
                      mt={2}
                      sx={{ 
                        '& p': { mb: 2, fontSize: 'sm', color: 'base.300' }, 
                        '& pre': { bg: 'base.900', p: 2, borderRadius: 'md', my: 2, overflowX: 'auto' }, 
                        '& code': { bg: 'base.900', px: 1, borderRadius: 'sm', fontFamily: 'monospace' }, 
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{thoughtContent}</ReactMarkdown>
                    </Box>
                  )}
                </Box>
              )}
              {displayContent.trim() && (
                <Box 
                  sx={{ 
                    '& p': { mb: 2 }, 
                    '& pre': { bg: 'base.800', p: 2, borderRadius: 'md', my: 2, overflowX: 'auto' }, 
                    '& code': { bg: 'base.800', px: 1, borderRadius: 'sm', fontFamily: 'monospace' }, 
                    '& ul, & ol': { pl: 4, mb: 2 }, 
                    '& li': { mb: 1 }, 
                    '& h1, & h2, & h3, & h4': { fontWeight: 'bold', mb: 2, mt: 4, color: 'base.50' },
                    '& table': { w: 'full', mb: 4, borderCollapse: 'collapse' },
                    '& th, & td': { border: '1px solid', borderColor: 'base.600', p: 2, textAlign: 'left' },
                    '& th': { bg: 'base.800', fontWeight: 'bold' },
                    '& > *:last-child': { mb: 0 }
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
                </Box>
              )}
            </Flex>
          ) : (
            <Text whiteSpace="pre-wrap">{msg.content}</Text>
          )}
        </Box>
        {msg.images && msg.images.length > 0 && (
          <Flex mt={2} gap={2} flexWrap="wrap">
            {msg.images.map((img: string) => (
              <ChatImagePreview key={img} imageName={img} />
            ))}
          </Flex>
        )}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {msg.tool_calls && msg.tool_calls.map((tool: any, idx: number) => {
          if (tool.function.name === 'apply_generation_parameters') {
            const args = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
            if (chatMode === 'click-to-apply') {
              return (
                <Box key={idx} mt={4} p={3} bg="base.800" borderRadius="md" border="1px solid" borderColor="invokeBlue.500">
                  <Text fontWeight="bold" color="invokeBlue.300" mb={2}>Suggested Settings</Text>
                  {args.positive_prompt && <Text fontSize="sm" mb={1}><b>Prompt:</b> {args.positive_prompt}</Text>}
                  {args.negative_prompt && <Text fontSize="sm" mb={1}><b>Negative:</b> {args.negative_prompt}</Text>}
                  {(args.width || args.height) && <Text fontSize="sm" mb={1}><b>Dimensions:</b> {args.width || '?'}x{args.height || '?'}</Text>}
                  {args.seed !== undefined && <Text fontSize="sm" mb={1}><b>Seed:</b> {args.seed}</Text>}
                  {args.generate_now && <Text fontSize="sm" mb={1} color="invokeYellow.300"><b>Action:</b> Will start generation automatically</Text>}
                  {/* eslint-disable-next-line react/jsx-no-bind */}
                  <Button size="sm" mt={2} colorScheme="invokeBlue" onClick={() => handleApplyParams(args)}>Apply to Generation</Button>
                </Box>
              );
            } else {
              return (
                <Box key={idx} mt={4} p={2} bg="base.800" borderRadius="md" borderLeft="4px solid" borderLeftColor="invokeGreen.500">
                  <Flex alignItems="center" gap={2}>
                    <PiCheckBold color="var(--invoke-colors-invokeGreen-300)" />
                    <Text fontSize="sm" color="invokeGreen.300">Automatically applied parameters to your canvas.</Text>
                  </Flex>
                </Box>
              );
            }
          }
          if (tool.function?.name === 'setup_advanced_workflow') {
            const args = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
            if (chatMode === 'click-to-apply') {
              return (
                <Box key={idx} mt={4} p={3} bg="base.800" borderRadius="md" border="1px solid" borderColor="invokePurple.500">
                  <Text fontWeight="bold" color="invokePurple.300" mb={2}>Advanced Workflow Setup: {args.workflow_name || 'Workflow'}</Text>
                  {args.positive_prompt && <Text fontSize="sm" mb={1}><b>Prompt:</b> {args.positive_prompt}</Text>}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {args.control_layers?.map((layer: any, i: number) => (
                    <Text key={i} fontSize="sm" mb={1}><b>Layer {i+1}:</b> {layer.type} ({layer.model_type})</Text>
                  ))}
                  {/* eslint-disable-next-line react/jsx-no-bind */}
                  <Button size="sm" mt={2} colorScheme="invokePurple" onClick={() => handleSetupWorkflow(args, msg.images)}>Apply Workflow</Button>
                </Box>
              );
            } else {
              return (
                <Box key={idx} mt={4} p={2} bg="base.800" borderRadius="md" borderLeft="4px solid" borderLeftColor="invokePurple.500">
                  <Flex alignItems="center" gap={2}>
                    <PiCheckBold color="var(--invoke-colors-invokePurple-300)" />
                    <Text fontSize="sm" color="invokePurple.300">Automatically configured {args.workflow_name || 'advanced'} workflow.</Text>
                  </Flex>
                </Box>
              );
            }
          }
          return null;
        })}
      </Box>
    </Flex>
  );
});

ChatMessageBubble.displayName = 'ChatMessageBubble';

export const ChatTab = memo(() => {
  const { data: modelsData, isLoading: isLoadingModels } = useListChatModelsQuery();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(true);

  const handleThinkingChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsThinkingEnabled(e.target.checked);
  }, []);

  const chatHistory = useStore($chatHistory);
  const activeModel = useStore($activeModel);
  const chatInput = useStore($chatInput);
  const chatImages = useStore($chatImages);
  const chatMode = useStore($chatMode);
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const invokeModel = useAppSelector(selectModel);
  const invokeModelConfig = useAppSelector(selectModelConfig);
  const invokeBase = useAppSelector(selectBase);
  const enqueueGenerate = useEnqueueGenerate();
  const canvasState = useAppSelector(selectCanvasSlice);
  const allCanvasEntities = useMemo(() => selectAllEntities(canvasState), [canvasState]);
  const params = useAppSelector(selectParamsSlice);

  const handleModeChange = useCallback(() => {
    $chatMode.set(chatMode === 'agentic' ? 'click-to-apply' : 'agentic');
  }, [chatMode]);

  const ASSISTANT_TOOLS = useMemo(() => [
    {
      type: 'function',
      function: {
        name: 'apply_generation_parameters',
        description: 'Apply specific image generation parameters (like prompt, seed, dimensions) directly to the user\'s generation panel.',
        parameters: {
          type: 'object',
          properties: {
            positive_prompt: { type: 'string', description: 'The main prompt text describing the image to generate.' },
            negative_prompt: { type: 'string', description: 'What NOT to include in the generated image.' },
            width: { type: 'integer', description: 'Width of the image in pixels (e.g. 512, 1024).' },
            height: { type: 'integer', description: 'Height of the image in pixels (e.g. 512, 1024).' },
            seed: { type: 'integer', description: 'The random seed for generation.' },
            steps: { type: 'integer', description: 'Number of denoising steps.' },
            cfg_scale: { type: 'number', description: 'CFG Scale (how strictly to follow the prompt).' },
            loras: {
              type: 'array',
              description: 'Optional list of LoRA names to apply (e.g. "MatchingPose", "Abstract_Retro_Future_Movie")',
              items: { type: 'string' }
            },
            generate_now: { type: 'boolean', description: 'Set to true to immediately start generating the image after applying parameters. Only set this to true if the user explicitly asks you to generate, create, make, or render the image.' },
          }
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'setup_advanced_workflow',
        description: 'Set up an advanced ComfyUI-style workflow like Face Swap, Pose Swap, or Style Transfer using ControlNet and IP-Adapters.',
        parameters: {
          type: 'object',
          properties: {
            workflow_name: { type: 'string', description: 'Name of the workflow (e.g. pose_and_style_transfer)' },
            loras: {
              type: 'array',
              description: 'Optional list of LoRA names to apply (e.g. "MatchingPose", "Consistency")',
              items: { type: 'string' }
            },
            control_layers: {
              type: 'array',
              description: 'List of control layers to add (e.g. ControlNet or IP-Adapter)',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['controlnet', 'ip_adapter'] },
                  model_type: { type: 'string', description: 'e.g. openpose, canny, ip-adapter-plus' }
                },
                required: ['type', 'model_type']
              }
            },
            positive_prompt: { type: 'string', description: 'The prompt to use for generation' },
            generate_now: { type: 'boolean', description: 'Set to true to immediately start generating the image after applying parameters.' },
          },
          required: ['workflow_name', 'control_layers', 'positive_prompt']
        }
      }
    }
  ], []);

  // imageDTO query removed from here

  const modelOptions = useMemo(() => {
    const models = modelsData?.models || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: Record<string, any[]> = {};
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    models.forEach((m: any) => {
      const family = m.details?.family || 'unknown';
      const sizeGB = m.size ? `${(m.size / 1e9).toFixed(2)  } GB` : '';
      const label = `${m.model} ${sizeGB ? `(${sizeGB})` : ''}`;
      
      if (!groups[family]) {
        groups[family] = [];
      }
      
      groups[family].push({ label, value: m.model });
    });
    
    return Object.entries(groups).map(([family, options]) => ({
      label: family.toUpperCase(),
      options
    }));
  }, [modelsData]);

  // Set default model if none selected
  useEffect(() => {
    if (!activeModel && modelOptions.length > 0) {
      const firstGroup = modelOptions[0];
      if (firstGroup?.options?.length > 0) {
        $activeModel.set(firstGroup.options[0].value);
      }
    }
  }, [activeModel, modelOptions]);

  const [controlNetModels] = useControlNetModels();
  const [ipAdapterModels] = useGlobalReferenceImageModels();
  const [loraModels] = useLoRAModels();
  const handleSetupWorkflow = useSetupWorkflow(controlNetModels, ipAdapterModels, loraModels, invokeBase);

  const activeBaseLoras = useMemo(() => {
    if (!invokeBase) {
      return [];
    }
    return loraModels.filter((m) => m.base === invokeBase);
  }, [loraModels, invokeBase]);

  const loraContext = useMemo(() => {
    if (activeBaseLoras.length === 0) {
      return 'No LoRAs installed for this base.';
    }
    return activeBaseLoras.map((lora) => {
      let context = `- ${lora.name}`;
      if (lora.description) {
        context += `: ${lora.description}`;
      }
      if (lora.trigger_phrases && lora.trigger_phrases.length > 0) {
        context += ` (Trigger Words: ${lora.trigger_phrases.join(', ')})`;
      }
      return context;
    }).join('\n');
  }, [activeBaseLoras]);

  const handleSend = useCallback(async () => {
    if ((!chatInput.trim() && chatImages.length === 0) || !activeModel) {
      return;
    }

    const imagesToSend = chatImages;

    const userMessage = { 
      id: uuidv4(), 
      role: 'user' as const, 
      content: chatInput.trim(),
      images: imagesToSend.length > 0 ? imagesToSend : undefined 
    };
    
    $chatHistory.set([...chatHistory, userMessage]);
    $chatInput.set('');
    $chatImages.set([]);

    try {
      setIsGenerating(true);
      const fluxRules = invokeBase === 'flux' ? `
FLUX.2 SPECIFIC RULES:
1. NEGATIVE PROMPTS: FLUX struggles with negation. NEVER use the 'negative_prompt' parameter. If the user asks to remove something (e.g., "no crowds"), use the REPLACEMENT STRATEGY: describe the positive alternative in the positive prompt (e.g., "peaceful solitude, empty pathways").
2. TEXT RENDERING: If the user wants text rendered in the image, wrap the exact wording in double quotes, describe its placement, and specify the typography style (e.g., "The text 'OPEN' appears in red neon letters").
3. COLORS: Use precise HEX color codes (e.g., #FF5733) when the user asks for specific colors or brand matching, and associate them directly with the object.
4. JSON PROMPTING: For highly complex multi-subject scenes or infographics, format your positive prompt as a JSON object (describing scene, subjects, style, lighting, camera, etc.).
5. ITERATIVE REFINEMENT: Suggest one incremental change at a time. If iterating on an existing image, explicitly ask the user to drag the generated image into the chat so you can use it as a reference image for the edit.
` : '';

      const isGemma4 = activeModel?.toLowerCase().includes('gemma4');
      const thinkPrefix = (isGemma4 && isThinkingEnabled) ? '<|think|>\n' : '';

      const systemMessage = {
        role: 'system',
        content: `${thinkPrefix}You are an AI assistant built into InvokeAI. The user is currently using the ${invokeBase || 'unknown'} generation model architecture, specifically ${invokeModel?.name || 'an unknown model'}.
${invokeModelConfig?.description ? `Model Description & Instructions:\n${invokeModelConfig.description}\n` : ''}
Tailor your advice, prompt engineering, and parameter suggestions to the capabilities of this specific architecture (e.g., FLUX vs SDXL).
${fluxRules}
        
If the user asks you to tweak, modify, or edit an image, you should use the attached image (which is their currently active generation) as the reference image in your advanced workflow setup.

Available LoRAs for ${invokeBase}:
${loraContext}

When a user asks for a specific style, check the "Available LoRAs" list and inject the relevant LoRA into your workflow, making sure to include its Trigger Words in your positive prompt. CRITICAL: If multiple versions of a LoRA exist (e.g., for 4B vs 9B parameter counts), you MUST select the exact version that matches the user's currently selected model. Do not use a 9B LoRA on a 4B model, and vice versa.

Current Generation Parameters:
- Prompt: ${params.positivePrompt || 'None'}
- Negative Prompt: ${params.negativePrompt || 'None'}
- Dimensions: ${(params as any).width ?? (params as any).dimensions?.width}x${(params as any).height ?? (params as any).dimensions?.height}
- Seed: ${params.seed}
- Steps: ${params.steps}
- CFG Scale: ${params.cfgScale}

Current Canvas Layers:
${allCanvasEntities.length > 0 ? allCanvasEntities.map(e => `- ${e.type} (ID: ${e.id}, Enabled: ${e.isEnabled}, Locked: ${e.isLocked})`).join('\n') : 'No layers active on canvas'}
        
IMPORTANT INSTRUCTION: You have access to a tool called \`apply_generation_parameters\`. If the user asks you to set, change, or update parameters (like prompt, dimensions, seed, etc.), you MUST call this tool. Do NOT just output text saying you changed them.
Additionally, you have access to \`setup_advanced_workflow\`. Use this tool when the user asks to transfer poses, styles, faces, or combine multiple references using ControlNets and IP-Adapters.`
      };

      const requestBody = {
        model: activeModel,
        messages: [systemMessage, ...chatHistory, userMessage].map((m) => ({ 
          role: m.role, 
          content: m.content,
          images: 'images' in m ? m.images : undefined
        })),
        tools: ASSISTANT_TOOLS,
        stream: true,
      };

      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) {
throw new Error('Chat stream failed');
}
      
      const reader = res.body?.getReader();
      if (!reader) {
throw new Error('No readable stream');
}
      
      const decoder = new TextDecoder();
      let assistantContent = '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toolCalls: any[] = [];
      const msgId = uuidv4();
      
      $chatHistory.set([...$chatHistory.get(), { id: msgId, role: 'assistant', content: '', tool_calls: [] }]);
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
break;
}
        
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const data = JSON.parse(dataStr);
              if (data.message) {
                 if (data.message.content) {
                   assistantContent += data.message.content;
                 }
                 if (data.message.tool_calls) {
                   toolCalls = [...toolCalls, ...data.message.tool_calls];
                 }
                 
                 const currentHistory = $chatHistory.get();
                 const newHistory = currentHistory.map(m => 
                   m.id === msgId ? { ...m, content: assistantContent, tool_calls: toolCalls } : m
                 );
                 $chatHistory.set(newHistory);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      if ($chatMode.get() === 'agentic' && toolCalls.length > 0) {
        for (const tool of toolCalls) {
          if (tool.function?.name === 'apply_generation_parameters') {
            const args = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
            if (args.positive_prompt) {
dispatch(positivePromptChanged(args.positive_prompt));
}
            if (args.negative_prompt) {
dispatch(negativePromptChanged(args.negative_prompt));
}
            if (args.width) {
dispatch(widthChanged({ width: args.width }));
}
            if (args.height) {
dispatch(heightChanged({ height: args.height }));
}
            if (args.seed !== undefined) {
dispatch(setSeed(args.seed));
}
            if (args.steps) {
dispatch(setSteps(args.steps));
}
            if (args.cfg_scale) {
              dispatch(setCfgScale(args.cfg_scale));
            }
            if (args.loras && Array.isArray(args.loras)) {
              args.loras.forEach((loraName: string) => {
                const matchedLora = loraModels.find((m) => m.base === invokeBase && m.name.toLowerCase().includes(loraName.toLowerCase()));
                if (matchedLora) {
                  dispatch(loraAdded({ model: matchedLora }));
                }
              });
            }
            if (args.generate_now) {
              // Wait a tiny bit for the state to settle before enqueueing
              setTimeout(() => enqueueGenerate(false), 100);
            }
          }
          if (tool.function?.name === 'setup_advanced_workflow') {
            const args = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
            await handleSetupWorkflow(args, chatImages);
            
            if (args.generate_now) {
              setTimeout(() => enqueueGenerate(false), 100);
            }
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Chat error:', err);
      $chatHistory.set([...$chatHistory.get(), { 
        id: uuidv4(), 
        role: 'assistant', 
        content: '⚠️ **Connection Error:** Failed to communicate with the AI. Please check if the backend is running and the Ollama server is accessible.' 
      }]);
    } finally {
      setIsGenerating(false);
    }
  }, [chatInput, activeModel, chatHistory, chatImages, invokeBase, invokeModel?.name, invokeModelConfig?.description, loraContext, ASSISTANT_TOOLS, dispatch, enqueueGenerate, params, allCanvasEntities, handleSetupWorkflow, loraModels, isThinkingEnabled]);

  const handleClear = useCallback(() => {
    $chatHistory.set([]);
  }, []);

  const handleRemoveImage = useCallback((imageName: string) => {
    $chatImages.set($chatImages.get().filter(name => name !== imageName));
  }, []);

  const handleModelChange = useCallback((v: { label: string; value: string } | null) => {
    $activeModel.set(v?.value || null);
  }, []);

  const noModelsMessage = useCallback(() => (isLoadingModels ? 'Loading...' : 'No models found'), [isLoadingModels]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    $chatInput.set(e.target.value);
  }, []);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Flex w="full" h="full" flexDir="column" bg="base.900" p={4} gap={4}>
      {/* Header */}
      <Flex alignItems="center" gap={4} p={4} bg="base.800" borderRadius="base">
        <Text fontSize="xl" fontWeight="semibold">
          AI Assistant
        </Text>
        <FormControl display="flex" alignItems="center" w="auto" ml={4}>
          <FormLabel htmlFor="agentic-mode" mb="0" fontSize="sm" color="base.300" cursor="pointer">
            Agentic Mode
          </FormLabel>
          <Switch
            id="agentic-mode"
            isChecked={chatMode === 'agentic'}
            onChange={handleModeChange}
          />
        </FormControl>
        <FormControl display="flex" alignItems="center" w="auto" ml={4}>
          <FormLabel htmlFor="thinking-mode" mb="0" fontSize="sm" color="base.300" cursor="pointer">
            Thinking
          </FormLabel>
          <Switch
            id="thinking-mode"
            isChecked={isThinkingEnabled}
            onChange={handleThinkingChange}
          />
        </FormControl>
        <Flex w="250px" ml="auto">
          { }
          <Combobox
            placeholder="Select Model"
            options={modelOptions}
            value={modelOptions.flatMap((g: { options: { value: string; label: string }[] }) => g.options).find((o: { value: string; label: string }) => o.value === activeModel) || null}
            onChange={handleModelChange}
            noOptionsMessage={noModelsMessage}
          />
        </Flex>
        <IconButton aria-label="Clear Chat" icon={<PiTrashBold />} onClick={handleClear} variant="ghost" />
      </Flex>

      {/* Chat History */}
      <Box flex={1} overflowY="auto" p={4} bg="base.800" borderRadius="base" ref={scrollRef}>
        <Flex flexDir="column" gap={4}>
          {chatHistory.length === 0 ? (
            <Flex h="full" alignItems="center" justifyContent="center">
              <Text color="base.500">Send a message to start chatting</Text>
            </Flex>
          ) : (
            chatHistory.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))
          )}
          {isGenerating && (
            <Flex w="full" justifyContent="flex-start" p={4}>
              <Spinner color="invokeBlue.500" size="md" />
              <Text ml={3} color="base.400" fontSize="sm">AI is thinking...</Text>
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Input Area (Dropzone) */}
      <Box position="relative">
        <Flex gap={2} flexDir="column" bg="base.800" p={2} borderRadius="base">
          {chatImages.length > 0 && (
            <Flex flexWrap="wrap" gap={2}>
              {chatImages.map((imgName) => (
                <ChatInputImagePreview key={imgName} imageName={imgName} onRemove={handleRemoveImage} />
              ))}
            </Flex>
          )}
          <Flex gap={2}>
            <Textarea
              placeholder="Ask something... (Drag an image here to add context)"
              value={chatInput}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              resize="none"
              rows={2}
              bg="base.800"
              border="none"
              _focus={{ boxShadow: 'none' }}
            />
            <Button
              onClick={handleSend}
              isDisabled={(!chatInput.trim() && chatImages.length === 0) || isGenerating || !activeModel}
              h="auto"
              px={8}
              colorScheme="invokeBlue"
            >
              <PiPaperPlaneRightFill size={20} />
            </Button>
          </Flex>
        </Flex>
        
        {/* Transparent Drop Target Overlay */}
        <DndDropTarget
          dndTarget={addImageToChatDndTarget}
          dndTargetData={addImageToChatDndTarget.getData()}
          label="Drop to add image context"
        />
      </Box>
    </Flex>
  );
});

ChatTab.displayName = 'ChatTab';
