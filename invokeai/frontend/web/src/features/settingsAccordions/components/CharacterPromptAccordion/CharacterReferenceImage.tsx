import { Flex } from '@invoke-ai/ui-library';
import { skipToken } from '@reduxjs/toolkit/query';
import { UploadImageIconButton } from 'common/hooks/useImageUploadButton';
import { DndImage } from 'features/dnd/DndImage';
import { DndImageIcon } from 'features/dnd/DndImageIcon';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiArrowCounterClockwiseBold } from 'react-icons/pi';
import { useGetImageDTOQuery } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';
import { useAppDispatch } from 'app/store/storeHooks';
import { characterUpdated } from 'features/characterPrompt/store/characterPromptSlice';
import { DndDropTarget } from 'features/dnd/DndDropTarget';
import { setCharacterReferenceImageDndTarget } from 'features/dnd/dnd';

type Props = {
  characterId: string;
  imageName?: string;
};

export const CharacterReferenceImage = memo(({ characterId, imageName }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const imageDTOReq = useGetImageDTOQuery(imageName ?? skipToken);
  const imageDTO = imageDTOReq.currentData;

  const handleResetImage = useCallback(() => {
    dispatch(characterUpdated({ id: characterId, changes: { referenceImageName: undefined } }));
  }, [dispatch, characterId]);

  const onUpload = useCallback(
    (imageDTO: ImageDTO) => {
      dispatch(characterUpdated({ id: characterId, changes: { referenceImageName: imageDTO.image_name } }));
    },
    [dispatch, characterId]
  );

  return (
      <Flex
        position="relative"
        w="full"
        h="full"
        minH={128}
        maxH={200}
        alignItems="center"
        justifyContent="center"
        bg="base.800"
        borderRadius="md"
        overflow="hidden"
      >
      {!imageDTO && (
        <UploadImageIconButton
          w="full"
          h="full"
          onUpload={onUpload}
          fontSize={36}
        />
      )}
      {imageDTO && (
        <>
          <DndImage imageDTO={imageDTO} borderRadius="base" borderWidth={1} borderStyle="solid" h="full" w="auto" />
          <Flex position="absolute" flexDir="column" top={2} insetInlineEnd={2} gap={1}>
            <DndImageIcon
              onClick={handleResetImage}
              icon={<PiArrowCounterClockwiseBold size={16} />}
              tooltip={t('common.reset')}
            />
          </Flex>
        </>
      )}
        <DndDropTarget
          dndTarget={setCharacterReferenceImageDndTarget}
          dndTargetData={setCharacterReferenceImageDndTarget.getData({ id: characterId })}
          label={t('gallery.drop')}
        />
      </Flex>
  );
});

CharacterReferenceImage.displayName = 'CharacterReferenceImage';
