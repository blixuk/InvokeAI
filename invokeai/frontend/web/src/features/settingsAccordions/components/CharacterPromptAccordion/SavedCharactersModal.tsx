import {
  Flex,
  Grid,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { savedCharacterDeleted, savedCharacterLoaded, selectCharacterPromptSlice } from 'features/characterPrompt/store/characterPromptSlice';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiTrashBold } from 'react-icons/pi';
import { useGetImageDTOQuery } from 'services/api/endpoints/images';
import { skipToken } from '@reduxjs/toolkit/query';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SavedCharacterCard = memo(({ character, onClick, onDelete }: any) => {
  const { data: imageDTO } = useGetImageDTOQuery(character.referenceImageName ?? skipToken);

  return (
    <Flex
      position="relative"
      flexDir="column"
      cursor="pointer"
      borderRadius="base"
      overflow="hidden"
      borderWidth="2px"
      borderColor="transparent"
      _hover={{ borderColor: 'invokeBlue.500', '& .delete-btn': { opacity: 1 } }}
      bg="base.900"
      onClick={() => onClick(character)}
    >
      <Flex aspectRatio="1/1" bg="base.800" w="full" alignItems="center" justifyContent="center">
        {imageDTO ? (
          <img
            src={imageDTO.thumbnail_url}
            alt={character.name}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            draggable={false}
          />
        ) : (
          <Text fontSize="xs" color="base.500">No Image</Text>
        )}
      </Flex>
      <Flex p={2} alignItems="center" justifyContent="center" bg="base.800">
        <Text fontSize="sm" fontWeight="semibold" noOfLines={1} title={character.name || 'Unnamed'}>
          {character.name || 'Unnamed'}
        </Text>
      </Flex>
      <IconButton
        className="delete-btn"
        position="absolute"
        top={1}
        right={1}
        size="xs"
        variant="solid"
        colorScheme="error"
        aria-label="Delete"
        icon={<PiTrashBold />}
        opacity={0}
        transition="opacity 0.2s"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(character.id);
        }}
      />
    </Flex>
  );
});
SavedCharacterCard.displayName = 'SavedCharacterCard';

export const SavedCharactersModal = memo(({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { savedCharacters } = useAppSelector(selectCharacterPromptSlice);

  const handleCharacterClick = useCallback(
    (character: any) => {
      dispatch(savedCharacterLoaded(character));
      onClose();
    },
    [dispatch, onClose]
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(savedCharacterDeleted(id));
    },
    [dispatch]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent maxH="80vh" h="80vh">
        <ModalHeader>Saved Characters Library</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" pb={4}>
          {savedCharacters.length === 0 && (
            <Flex w="full" h="full" alignItems="center" justifyContent="center">
              <Text color="base.500">No saved characters yet.</Text>
            </Flex>
          )}
          {savedCharacters.length > 0 && (
            <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={4}>
              {savedCharacters.map((char) => (
                <SavedCharacterCard 
                  key={char.id} 
                  character={char} 
                  onClick={handleCharacterClick}
                  onDelete={handleDelete}
                />
              ))}
            </Grid>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

SavedCharactersModal.displayName = 'SavedCharactersModal';
