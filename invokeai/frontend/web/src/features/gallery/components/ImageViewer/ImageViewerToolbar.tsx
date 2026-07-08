import { ButtonGroup, Flex, IconButton, Spacer } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { ToggleMetadataViewerButton } from 'features/gallery/components/ImageViewer/ToggleMetadataViewerButton';
import { selectLastSelectedItem } from 'features/gallery/store/gallerySelectors';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PiFrameCornersBold,
  PiMagnifyingGlassMinusBold,
  PiMagnifyingGlassPlusBold,
} from 'react-icons/pi';
import { useControls } from 'react-zoom-pan-pinch';
import { useImageDTO } from 'services/api/endpoints/images';

import { CurrentImageButtons } from './CurrentImageButtons';
import { ToggleProgressButton } from './ToggleProgressButton';

export const ImageViewerToolbar = memo(() => {
  const { t } = useTranslation();
  const lastSelectedItem = useAppSelector(selectLastSelectedItem);
  const imageDTO = useImageDTO(lastSelectedItem);
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleReset = useCallback(() => {
    resetTransform();
  }, [resetTransform]);

  return (
    <Flex w="full" justifyContent="center" h={8} gap={2}>
      <ToggleProgressButton />
      <ButtonGroup>
        <IconButton
          tooltip={t('nodes.zoomInNodes')}
          aria-label={t('nodes.zoomInNodes')}
          icon={<PiMagnifyingGlassPlusBold />}
          onClick={handleZoomIn}
        />
        <IconButton
          tooltip={t('nodes.zoomOutNodes')}
          aria-label={t('nodes.zoomOutNodes')}
          icon={<PiMagnifyingGlassMinusBold />}
          onClick={handleZoomOut}
        />
        <IconButton
          tooltip={t('nodes.fitViewportNodes')}
          aria-label={t('nodes.fitViewportNodes')}
          icon={<PiFrameCornersBold />}
          onClick={handleReset}
        />
      </ButtonGroup>
      <Spacer />
      {imageDTO && <CurrentImageButtons imageDTO={imageDTO} />}
      <Spacer />
      {imageDTO && <ToggleMetadataViewerButton />}
    </Flex>
  );
});

ImageViewerToolbar.displayName = 'ImageViewerToolbar';
