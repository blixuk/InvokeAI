/* eslint-disable react/jsx-no-bind */
import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
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
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useDisclosure,
} from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import ScrollableContent from 'common/components/OverlayScrollbars/ScrollableContent';
import { setGlobalReferenceImage } from 'features/imageActions/actions';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  PiArrowRightBold,
  PiGridFourBold,
  PiPlusBold,
  PiSquaresFourBold,
  PiTrashBold,
  PiUploadBold,
  PiXBold,
} from 'react-icons/pi';
import { useListImagesQuery, useUploadImageMutation } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';

type Props = {
  id: string;
  children?: React.ReactElement;
};

interface GridSlot {
  id: string;
  imageDTO: ImageDTO | null;
}

export const RefImageGridModal = memo(({ id, children }: Props) => {
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadImage] = useUploadImageMutation();

  // Stitch options
  const [presetSize, setPresetSize] = useState<string>('1024x1024');
  const [customWidth, setCustomWidth] = useState<number>(1024);
  const [customHeight, setCustomHeight] = useState<number>(1024);
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'grid'>('grid');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [spacing, setSpacing] = useState<number>(10);
  const [bgColor, setBgColor] = useState<string>('#151519');

  // Slots
  const [slots, setSlots] = useState<GridSlot[]>([
    { id: 'slot-1', imageDTO: null },
    { id: 'slot-2', imageDTO: null },
  ]);
  const [activeSlotId, setActiveSlotId] = useState<string>('slot-1');

  // Query recent images from gallery
  const { data: recentImagesData } = useListImagesQuery({
    categories: ['general', 'user'],
    is_intermediate: false,
    limit: 30,
  });

  const recentImages = recentImagesData?.items ?? [];

  // Canvas elements
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Add slot
  const handleAddSlot = useCallback(() => {
    if (slots.length >= 6) {
return;
}
    const newId = `slot-${Date.now()}`;
    setSlots((prev) => [...prev, { id: newId, imageDTO: null }]);
    setActiveSlotId(newId);
  }, [slots.length]);

  // Remove slot
  const handleRemoveSlot = useCallback((slotId: string) => {
    setSlots((prev) => {
      const nextSlots = prev.filter((s) => s.id !== slotId);
      if (nextSlots.length < 2) {
return prev;
} // keep at least 2 slots
      return nextSlots;
    });
    setActiveSlotId((prevId) => (prevId === slotId ? 'slot-1' : prevId));
  }, []);

  // Update slot image
  const handleSetSlotImage = useCallback((slotId: string, imageDTO: ImageDTO | null) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, imageDTO } : s))
    );
  }, []);

  // Handle local image upload for slot
  const handleLocalUpload = useCallback(
    async (slotId: string, file: File) => {
      try {
        const imageDTO = await uploadImage({
          file,
          image_category: 'user',
          is_intermediate: false,
        }).unwrap();
        handleSetSlotImage(slotId, imageDTO);
      } catch (e) {
        console.error('Failed to upload image', e);
      }
    },
    [uploadImage, handleSetSlotImage]
  );

  // Width/Height getters
  const getDimensions = useCallback(() => {
    if (presetSize === 'custom') {
      return { width: customWidth, height: customHeight };
    }
    const [w, h] = presetSize.split('x').map(Number);
    return { width: w || 1024, height: h || 1024 };
  }, [presetSize, customWidth, customHeight]);

  // Render & Draw Stitch Live Preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) {
return;
}
    const ctx = canvas.getContext('2d');
    if (!ctx) {
return;
}

    const { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const numSlots = slots.length;
    let cols = 1;
    let rows = 1;

    if (layout === 'horizontal') {
      cols = numSlots;
      rows = 1;
    } else if (layout === 'vertical') {
      cols = 1;
      rows = numSlots;
    } else {
      cols = Math.ceil(Math.sqrt(numSlots));
      rows = Math.ceil(numSlots / cols);
    }

    const totalSpacingX = (cols - 1) * spacing;
    const totalSpacingY = (rows - 1) * spacing;

    const cellWidth = (width - totalSpacingX) / cols;
    const cellHeight = (height - totalSpacingY) / rows;

    let loadedCount = 0;
    const imagesToDraw: { img: HTMLImageElement | null; x: number; y: number }[] = [];

    slots.forEach((slot, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const cellX = col * (cellWidth + spacing);
      const cellY = row * (cellHeight + spacing);

      if (!slot.imageDTO) {
        // Empty slots remain filled with the background color (bgColor)
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = slot.imageDTO.image_url;

      img.onload = () => {
        loadedCount++;
        imagesToDraw[index] = { img, x: cellX, y: cellY };

        // Once all images loaded, draw them
        if (loadedCount === slots.filter((s) => s.imageDTO !== null).length) {
          slots.forEach((s, idx) => {
            const drawData = imagesToDraw[idx];
            if (!drawData || !drawData.img) {
return;
}

            const { img: loadedImg, x, y } = drawData;
            ctx.save();
            // Clip to slot boundary
            ctx.beginPath();
            ctx.rect(x, y, cellWidth, cellHeight);
            ctx.clip();

            const imgRatio = loadedImg.width / loadedImg.height;
            const cellRatio = cellWidth / cellHeight;

            if (fitMode === 'cover') {
              let sx = 0; let sy = 0; let sw = loadedImg.width; let sh = loadedImg.height;
              if (imgRatio > cellRatio) {
                sw = loadedImg.height * cellRatio;
                sx = (loadedImg.width - sw) / 2;
              } else {
                sh = loadedImg.width / cellRatio;
                sy = (loadedImg.height - sh) / 2;
              }
              ctx.drawImage(loadedImg, sx, sy, sw, sh, x, y, cellWidth, cellHeight);
            } else {
              // Fit/Contain
              let dw = cellWidth; let dh = cellHeight;
              let dx = x; let dy = y;
              if (imgRatio > cellRatio) {
                dh = cellWidth / imgRatio;
                dy = y + (cellHeight - dh) / 2;
              } else {
                dw = cellHeight * imgRatio;
                dx = x + (cellWidth - dw) / 2;
              }
              // Fill slot cell background with black/bg before contain draw
              ctx.fillStyle = bgColor;
              ctx.fillRect(x, y, cellWidth, cellHeight);
              ctx.drawImage(loadedImg, dx, dy, dw, dh);
            }
            ctx.restore();
          });
        }
      };
    });
  }, [slots, layout, fitMode, spacing, bgColor, presetSize, customWidth, customHeight, getDimensions]);

  // Handle final stitch action
  const handleStitchAndSave = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) {
return;
}

    canvas.toBlob(async (blob) => {
      if (!blob) {
return;
}
      const file = new File([blob], `reference_grid_${Date.now()}.png`, { type: 'image/png' });

      try {
        const uploadedImageDTO = await uploadImage({
          file,
          image_category: 'general',
          is_intermediate: false,
        }).unwrap();

        setGlobalReferenceImage({ imageDTO: uploadedImageDTO, id, dispatch });
        onClose();
      } catch (e) {
        console.error('Failed to upload combined grid image', e);
      }
    }, 'image/png');
  }, [dispatch, id, onClose, uploadImage]);

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
          icon={<PiSquaresFourBold size={20} />}
          onClick={onOpen}
          aria-label="Create image grid"
          tooltip="Combine multiple images into a grid reference image"
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered useInert={false}>
        <ModalOverlay />
        <ModalContent bg="base.900" maxH="90vh" h="85vh" borderRadius="lg" border="1px solid" borderColor="base.800">
          <ModalHeader borderBottom="1px solid" borderColor="base.800" py={3}>
            <Flex alignItems="center" gap={2}>
              <PiGridFourBold size={22} color="var(--invoke-blue-500)" />
              <Heading fontSize="lg">Reference Grid Creator</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" p={4} gap={4} overflow="hidden">
            <Grid templateColumns="1fr 1fr" gap={6} h="full" overflow="hidden">
              {/* Left Column - Configurations & Slots */}
              <GridItem display="flex" flexDir="column" gap={4} h="full" overflow="hidden">
                <ScrollableContent>
                  <Flex flexDir="column" gap={4} pr={2}>
                    <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                      Grid Configuration
                    </Heading>

                    {/* Presets & Custom Dimensions */}
                    <Flex gap={3} w="full">
                      <FormControl flexGrow={1}>
                        <FormLabel fontSize="xs">Grid Resolution</FormLabel>
                        <Select
                          value={presetSize}
                          onChange={(e) => setPresetSize(e.target.value)}
                          size="sm"
                        >
                          <option value="1024x1024">1024 x 1024 (1:1 Square)</option>
                          <option value="896x1152">896 x 1152 (3:4 Portrait)</option>
                          <option value="1152x896">1152 x 896 (4:3 Landscape)</option>
                          <option value="768x1024">768 x 1024 (3:4 Portrait)</option>
                          <option value="1024x768">1024 x 768 (4:3 Landscape)</option>
                          <option value="2048x2048">2048 x 2048 (High-Res 1:1)</option>
                          <option value="custom">Custom Size...</option>
                        </Select>
                      </FormControl>

                      {presetSize === 'custom' && (
                        <Flex gap={2} alignItems="flex-end">
                          <FormControl w="20">
                            <FormLabel fontSize="xs">Width</FormLabel>
                            <NumberInput
                              value={customWidth}
                              onChange={(_, v) => setCustomWidth(v)}
                              min={128}
                              max={4096}
                              size="sm"
                            >
                              <NumberInputField />
                            </NumberInput>
                          </FormControl>
                          <FormControl w="20">
                            <FormLabel fontSize="xs">Height</FormLabel>
                            <NumberInput
                              value={customHeight}
                              onChange={(_, v) => setCustomHeight(v)}
                              min={128}
                              max={4096}
                              size="sm"
                            >
                              <NumberInputField />
                            </NumberInput>
                          </FormControl>
                        </Flex>
                      )}
                    </Flex>

                    {/* Layout, Scaling, Background */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl>
                        <FormLabel fontSize="xs">Layout Arrangement</FormLabel>
                        <Select
                          value={layout}
                          onChange={(e) => {
                            setLayout(e.target.value as 'horizontal' | 'vertical' | 'grid');
                          }}
                          size="sm"
                        >
                          <option value="grid">Grid (Auto Row/Col)</option>
                          <option value="horizontal">Horizontal Side-by-Side</option>
                          <option value="vertical">Vertical Stacked</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs">Scaling / Fit Mode</FormLabel>
                        <Select
                          value={fitMode}
                          onChange={(e) => {
                            setFitMode(e.target.value as 'cover' | 'contain');
                          }}
                          size="sm"
                        >
                          <option value="cover">Crop & Fill (Cover)</option>
                          <option value="contain">Fit & Pad (Contain)</option>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl>
                        <FormLabel fontSize="xs">Slot Gap Spacing ({spacing}px)</FormLabel>
                        <Slider
                          value={spacing}
                          onChange={setSpacing}
                          min={0}
                          max={100}
                          step={1}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs">Background Color</FormLabel>
                        <Select
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          size="sm"
                        >
                          <option value="#151519">Dark Charcoal</option>
                          <option value="#000000">Jet Black</option>
                          <option value="#ffffff">Pure White</option>
                          <option value="rgba(0,0,0,0)">Transparent</option>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Divider borderColor="base.800" my={2} />

                    {/* Image Slots */}
                    <Flex justifyContent="space-between" alignItems="center">
                      <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                        Stitching Slots ({slots.length}/6)
                      </Heading>
                      <Button
                        size="xs"
                        leftIcon={<PiPlusBold />}
                        onClick={handleAddSlot}
                        isDisabled={slots.length >= 6}
                        variant="outline"
                      >
                        Add Slot
                      </Button>
                    </Flex>

                    <Flex flexDir="column" gap={2}>
                      {slots.map((slot, index) => {
                        const isActive = slot.id === activeSlotId;
                        return (
                          <Flex
                            key={slot.id}
                            alignItems="center"
                            p={2}
                            borderRadius="base"
                            bg={isActive ? 'base.800' : 'base.850'}
                            border="1px solid"
                            borderColor={isActive ? 'blue.500' : 'base.750'}
                            cursor="pointer"
                            onClick={() => setActiveSlotId(slot.id)}
                            transition="all 0.2s"
                            _hover={{ borderColor: isActive ? 'blue.400' : 'base.600' }}
                          >
                            <Flex gap={3} alignItems="center" flexGrow={1}>
                              <Flex
                                h={12}
                                w={12}
                                bg="base.900"
                                borderRadius="base"
                                alignItems="center"
                                justifyContent="center"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="base.700"
                                position="relative"
                              >
                                {slot.imageDTO ? (
                                  <img
                                    src={slot.imageDTO.thumbnail_url}
                                    alt="slot preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <PiUploadBold size={16} color="var(--invoke-base-500)" />
                                )}
                              </Flex>
                              <Flex flexDir="column">
                                <Text fontSize="xs" fontWeight="semibold">
                                  Slot #{index + 1}
                                </Text>
                                <Text fontSize="xx-small" color="base.400">
                                  {slot.imageDTO ? 'Image Selected' : 'Empty - click to select'}
                                </Text>
                              </Flex>
                            </Flex>

                            {/* Slot Actions */}
                            <Flex gap={1} alignItems="center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                id={`file-upload-${slot.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
handleLocalUpload(slot.id, file);
}
                                }}
                              />
                              <IconButton
                                icon={<PiUploadBold size={14} />}
                                size="xs"
                                variant="ghost"
                                onClick={() => {
                                  document.getElementById(`file-upload-${slot.id}`)?.click();
                                }}
                                aria-label="Upload file for slot"
                                tooltip="Upload local image file"
                              />
                              {slot.imageDTO && (
                                <IconButton
                                  icon={<PiXBold size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleSetSlotImage(slot.id, null)}
                                  aria-label="Clear slot image"
                                  tooltip="Clear image"
                                />
                              )}
                              <IconButton
                                icon={<PiTrashBold size={14} />}
                                size="xs"
                                variant="ghost"
                                colorScheme="error"
                                isDisabled={slots.length <= 2}
                                onClick={() => handleRemoveSlot(slot.id)}
                                aria-label="Remove slot"
                                tooltip="Remove slot"
                              />
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Flex>
                </ScrollableContent>
              </GridItem>

              {/* Right Column - Live Preview & Quick Gallery */}
              <GridItem display="flex" flexDir="column" h="full" overflow="hidden" gap={4}>
                <Flex flexDir="column" gap={2} flexGrow={1} overflow="hidden">
                  <Heading fontSize="sm" color="base.400" textTransform="uppercase" letterSpacing="wider">
                    Live Grid Preview
                  </Heading>

                  {/* Canvas Container */}
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
                    <canvas
                      ref={previewCanvasRef}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.5)',
                        borderRadius: '4px',
                      }}
                    />
                  </Flex>
                </Flex>

                {/* Quick Gallery Selection */}
                <Flex flexDir="column" gap={2} h="40%" overflow="hidden">
                  <Divider borderColor="base.800" />
                  <Heading fontSize="xs" color="base.400" textTransform="uppercase" letterSpacing="wider">
                    Select Image from Gallery (Click to place in Slot #{slots.findIndex((s) => s.id === activeSlotId) + 1})
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
                          borderColor="transparent"
                          cursor="pointer"
                          transition="all 0.15s"
                          _hover={{ borderColor: 'blue.400', transform: 'scale(1.03)' }}
                          onClick={() => handleSetSlotImage(activeSlotId, img)}
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
              <Button size="sm" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                rightIcon={<PiArrowRightBold />}
                onClick={handleStitchAndSave}
                isDisabled={slots.every((s) => s.imageDTO === null)}
              >
                Create Grid & Use as Reference
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

RefImageGridModal.displayName = 'RefImageGridModal';
