import { Button, Flex, Text } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { useImageUploadButton } from 'common/hooks/useImageUploadButton';
import { useRefImageIdContext } from 'features/controlLayers/contexts/RefImageIdContext';
import type { SetGlobalReferenceImageDndTargetData } from 'features/dnd/dnd';
import { setGlobalReferenceImageDndTarget } from 'features/dnd/dnd';
import { DndDropTarget } from 'features/dnd/DndDropTarget';
import { setGlobalReferenceImage } from 'features/imageActions/actions';
import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { PiMagicWandBold, PiSquaresFourBold } from 'react-icons/pi';
import type { ImageDTO } from 'services/api/types';
import { RefImageGridModal } from './RefImageGridModal';
import { RefImageProcessorModal } from './RefImageProcessorModal';

export const RefImageNoImageState = memo(() => {
  const { t } = useTranslation();
  const id = useRefImageIdContext();
  const dispatch = useAppDispatch();
  const onUpload = useCallback(
    (imageDTO: ImageDTO) => {
      setGlobalReferenceImage({ imageDTO, id, dispatch });
    },
    [dispatch, id]
  );
  const uploadApi = useImageUploadButton({ onUpload, allowMultiple: false });

  const dndTargetData = useMemo<SetGlobalReferenceImageDndTargetData>(
    () => setGlobalReferenceImageDndTarget.getData({ id }),
    [id]
  );

  const components = useMemo(
    () => ({
      UploadButton: <Button size="sm" variant="link" color="base.300" {...uploadApi.getUploadButtonProps()} />,
    }),
    [uploadApi]
  );

  return (
    <Flex flexDir="column" gap={3} position="relative" w="full" p={4}>
      <Text textAlign="center" color="base.300">
        <Trans i18nKey="controlLayers.referenceImageEmptyState" components={components} />
      </Text>
      <input {...uploadApi.getUploadInputProps()} />
      <DndDropTarget
        dndTarget={setGlobalReferenceImageDndTarget}
        dndTargetData={dndTargetData}
        label={t('controlLayers.useImage')}
      />
      <Flex gap={2} mt={1} width="full" justifyContent="center">
        <RefImageGridModal id={id}>
          <Button size="xs" variant="outline" leftIcon={<PiSquaresFourBold />}>
            Combine Grid
          </Button>
        </RefImageGridModal>
        <RefImageProcessorModal id={id}>
          <Button size="xs" variant="outline" leftIcon={<PiMagicWandBold />}>
            Preprocess
          </Button>
        </RefImageProcessorModal>
      </Flex>
    </Flex>
  );
});

RefImageNoImageState.displayName = 'RefImageNoImageState';

