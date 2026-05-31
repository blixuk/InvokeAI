import {
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppDispatch } from 'app/store/storeHooks';
import ScrollableContent from 'common/components/OverlayScrollbars/ScrollableContent';
import { FilterSettings } from 'features/controlLayers/components/Filters/FilterSettings';
import { FilterTypeSelect } from 'features/controlLayers/components/Filters/FilterTypeSelect';
import type { FilterConfig } from 'features/controlLayers/store/filters';
import { IMAGE_FILTERS } from 'features/controlLayers/store/filters';
import { setGlobalReferenceImage } from 'features/imageActions/actions';
import { zImageOutput } from 'features/nodes/types/common';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PiArrowRightBold,
  PiMagicWandBold,
  PiUploadBold,
  PiWarningBold,
  PiXBold,
} from 'react-icons/pi';
import { getImageDTO, useGetImageDTOQuery, useListImagesQuery, useUploadImageMutation } from 'services/api/endpoints/images';
import { buildRunGraphDependencies, runGraph } from 'services/api/run-graph';
import type { ImageDTO } from 'services/api/types';
import { $socket } from 'services/events/stores';

type Props = {
  id: string;
  currentImageName?: string | null;
  children?: React.ReactElement;
};

export const RefImageProcessorModal = memo(({ id, currentImageName, children }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const socket = useStore($socket);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadImage] = useUploadImageMutation();

  // Selected input image
  const [inputImage, setInputImage] = useState<ImageDTO | null>(null);
  const [outputImage, setOutputImage] = useState<ImageDTO | null>(null);

  // Filter settings
  const [filterType, setFilterType] = useState<FilterConfig['type']>('canny_edge_detection');
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() =>
    IMAGE_FILTERS.canny_edge_detection.buildDefaults()
  );

  // Execution state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current image if provided as default
  const { currentData: currentImageDTO } = useGetImageDTOQuery(currentImageName ?? '');

  // Set default input image when modal opens or current image changes
  useEffect(() => {
    if (isOpen && currentImageDTO) {
      setInputImage(currentImageDTO);
    }
  }, [isOpen, currentImageDTO]);

  // Query recent images from gallery for input selection
  const { data: recentImagesData } = useListImagesQuery({
    categories: ['general', 'user'],
    is_intermediate: false,
    limit: 30,
  });
  const recentImages = recentImagesData?.items ?? [];

  // Handle preprocessor type change
  const handleFilterTypeChange = useCallback((type: FilterConfig['type']) => {
    setFilterType(type);
    setFilterConfig(IMAGE_FILTERS[type].buildDefaults());
  }, []);

  // Handle parameter value changes
  const handleFilterConfigChange = useCallback((config: FilterConfig) => {
    setFilterConfig(config);
  }, []);

  // Upload local image as input
  const handleLocalUpload = useCallback(
    async (file: File) => {
      try {
        const imageDTO = await uploadImage({
          file,
          image_category: 'user',
          is_intermediate: false,
        }).unwrap();
        setInputImage(imageDTO);
      } catch (e) {
        console.error('Failed to upload input image', e);
      }
    },
    [uploadImage]
  );

  // Run the preprocessor graph on the backend
  const handleRunPreprocessor = useCallback(async () => {
    if (!inputImage || !socket) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOutputImage(null);

    try {
      const filterData = IMAGE_FILTERS[filterType];
      const imageWithDims = {
        image_name: inputImage.image_name,
        width: inputImage.width,
        height: inputImage.height,
      };

      const { graph, outputNodeId } = filterData.buildGraph(imageWithDims, filterConfig as any);
      const dependencies = buildRunGraphDependencies(dispatch, socket);

      const { output } = await runGraph({
        dependencies,
        graph,
        outputNodeId,
        options: {
          prepend: true,
        },
      });

      const parseResult = zImageOutput.safeParse(output);
      if (!parseResult.success) {
        throw new Error('Graph output is not a valid ImageOutput.');
      }

      const imageOutput = parseResult.data;
      const outputDTO = await getImageDTO(imageOutput.image.image_name);
      setOutputImage(outputDTO);
    } catch (e) {
      console.error('Preprocessor failed', e);
      setError(e instanceof Error ? e.message : 'Unknown error during preprocessing');
    } finally {
      setIsProcessing(false);
    }
  }, [inputImage, socket, filterType, filterConfig, dispatch]);

  // Apply output as reference image
  const handleApplyReference = useCallback(() => {
    if (!outputImage) {
      return;
    }
    setGlobalReferenceImage({ imageDTO: outputImage, id, dispatch });
    onClose();
  }, [dispatch, id, outputImage, onClose]);

  return (
    <>
      {children ? (
        typeof children.type === 'string' ? (
          children
        ) : (
          <span onClick={onOpen}>{children}</span>
        )
      ) : (
        <IconButton
          icon={<PiMagicWandBold size={20} />}
          onClick={onOpen}
          aria-label="Process reference image"
          tooltip="Process image with controlnets/filters (Canny, Depth, Pose, etc.)"
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered useInert={false}>
        <ModalOverlay />
        <ModalContent bg="base.900" maxH="90vh" h="85vh" borderRadius="lg" border="1px solid" borderColor="base.800">
          <ModalHeader borderBottom="1px solid" borderColor="base.800" py={3}>
            <Flex alignItems="center" gap={2}>
              <PiMagicWandBold size={22} color="var(--invoke-blue-500)" />
              <Heading fontSize="lg">ControlNet Image Preprocessor</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" p={4} gap={4} overflow="hidden">
            <Grid templateColumns="1fr 1fr" gap={6} h="full" overflow="hidden">
              {/* Left Column - Configurations & Settings */}
              <GridItem display="flex" flexDir="column" gap={4} h="full" overflow="hidden">
                <ScrollableContent>
                  <Flex flexDir="column" gap={4} pr={2}>
                    <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                      Select Preprocessor
                    </Heading>

                    {/* Preprocessor Dropdown */}
                    <FilterTypeSelect filterType={filterType} onChange={handleFilterTypeChange} />

                    <Divider borderColor="base.800" my={2} />

                    <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                      Preprocessor Parameters
                    </Heading>

                    {/* Preprocessor Parameters Form */}
                    <Flex flexDir="column" gap={4} p={3} bg="base.850" borderRadius="base" border="1px solid" borderColor="base.750">
                      <FilterSettings filterConfig={filterConfig} onChange={handleFilterConfigChange} />
                    </Flex>

                    <Divider borderColor="base.800" my={2} />

                    {/* Input Image Display */}
                    <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                      Input Image
                    </Heading>
                    <Flex
                      p={3}
                      bg="base.850"
                      borderRadius="base"
                      border="1px solid"
                      borderColor={inputImage ? 'base.750' : 'dashed'}
                      alignItems="center"
                      gap={4}
                    >
                      <Flex
                        h={20}
                        w={20}
                        bg="base.900"
                        borderRadius="base"
                        alignItems="center"
                        justifyContent="center"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="base.700"
                        position="relative"
                        flexShrink={0}
                      >
                        {inputImage ? (
                          <img
                            src={inputImage.thumbnail_url}
                            alt="input thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <PiUploadBold size={24} color="var(--invoke-base-500)" />
                        )}
                      </Flex>

                      <Flex flexDir="column" gap={1} flexGrow={1}>
                        {inputImage ? (
                          <>
                            <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>
                              {inputImage.image_name}
                            </Text>
                            <Text fontSize="xx-small" color="base.400">
                              Dimensions: {inputImage.width} x {inputImage.height}
                            </Text>
                          </>
                        ) : (
                          <Text fontSize="xs" color="base.400">
                            No input image selected. Upload one or click one from the gallery below.
                          </Text>
                        )}
                      </Flex>

                      <Flex gap={1}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="preprocessor-file-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleLocalUpload(file);
                            }
                          }}
                        />
                        <Button
                          size="xs"
                          leftIcon={<PiUploadBold />}
                          onClick={() => document.getElementById('preprocessor-file-upload')?.click()}
                        >
                          Upload
                        </Button>
                        {inputImage && (
                          <IconButton
                            icon={<PiXBold size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => setInputImage(null)}
                            aria-label="Clear input image"
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                </ScrollableContent>
              </GridItem>

              {/* Right Column - Preview Map & Gallery */}
              <GridItem display="flex" flexDir="column" h="full" overflow="hidden" gap={4}>
                <Flex flexDir="column" gap={2} flexGrow={1} overflow="hidden">
                  <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                    Processed Output Map
                  </Heading>

                  {/* Canvas Output Display */}
                  <Flex
                    flexGrow={1}
                    bg="#0c0c0e"
                    borderRadius="base"
                    border="1px solid"
                    borderColor="base.800"
                    alignItems="center"
                    justifyContent="center"
                    p={4}
                    position="relative"
                    overflow="hidden"
                  >
                    {isProcessing && (
                      <Flex
                        position="absolute"
                        inset={0}
                        bg="rgba(12, 12, 14, 0.8)"
                        zIndex={2}
                        alignItems="center"
                        justifyContent="center"
                        flexDir="column"
                        gap={3}
                        backdropFilter="blur(4px)"
                      >
                        <Spinner size="xl" color="blue.500" thickness="3px" />
                        <Text fontSize="sm" fontWeight="semibold" color="blue.400">
                          Running Backend Preprocessor...
                        </Text>
                        <Text fontSize="xx-small" color="base.400">
                          Creating graph and processing node inputs
                        </Text>
                      </Flex>
                    )}

                    {error && (
                      <Flex flexDir="column" alignItems="center" gap={2} p={4} maxW="xs" textAlign="center">
                        <PiWarningBold size={36} color="var(--invoke-error-500)" />
                        <Text fontSize="xs" fontWeight="semibold" color="error.300">
                          Processing Failed
                        </Text>
                        <Text fontSize="xx-small" color="base.400">
                          {error}
                        </Text>
                      </Flex>
                    )}

                    {!isProcessing && !error && outputImage && (
                      <img
                        src={outputImage.image_url}
                        alt="preprocessor output map"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.5)',
                          borderRadius: '4px',
                        }}
                      />
                    )}

                    {!isProcessing && !error && !outputImage && (
                      <Flex flexDir="column" alignItems="center" gap={1} color="base.500">
                        <PiMagicWandBold size={40} />
                        <Text fontSize="xs">Run preprocessor to view output map</Text>
                      </Flex>
                    )}
                  </Flex>
                </Flex>

                {/* Recent Images Selection */}
                <Flex flexDir="column" gap={2} h="40%" overflow="hidden">
                  <Divider borderColor="base.800" />
                  <Heading fontSize="xs" color="base.400" textTransform="uppercase" letterSpacing="wider">
                    Choose Input Image from Gallery
                  </Heading>
                  <ScrollableContent>
                    <Grid templateColumns="repeat(5, 1fr)" gap={2} p={1}>
                      {recentImages.map((img) => (
                        <GridItem
                          key={img.image_name}
                          h="16"
                          w="full"
                          bg="base.800"
                          borderRadius="base"
                          overflow="hidden"
                          border="2px solid"
                          borderColor={inputImage?.image_name === img.image_name ? 'blue.500' : 'transparent'}
                          cursor="pointer"
                          transition="all 0.15s"
                          _hover={{ borderColor: 'blue.400', transform: 'scale(1.03)' }}
                          onClick={() => {
                            setInputImage(img);
                            setOutputImage(null);
                            setError(null);
                          }}
                        >
                          <img
                            src={img.thumbnail_url}
                            alt="recent thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </GridItem>
                      ))}
                    </Grid>
                  </ScrollableContent>
                </Flex>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="base.800" py={3}>
            <Flex gap={2}>
              <Button size="sm" variant="ghost" onClick={onClose} isDisabled={isProcessing}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<PiMagicWandBold />}
                onClick={handleRunPreprocessor}
                isLoading={isProcessing}
                isDisabled={!inputImage}
              >
                Run Preprocessor
              </Button>
              {outputImage && (
                <Button
                  size="sm"
                  colorScheme="green"
                  rightIcon={<PiArrowRightBold />}
                  onClick={handleApplyReference}
                >
                  Use as Reference Map
                </Button>
              )}
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

RefImageProcessorModal.displayName = 'RefImageProcessorModal';
