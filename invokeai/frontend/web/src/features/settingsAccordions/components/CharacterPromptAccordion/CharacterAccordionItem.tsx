import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, FormControl, FormLabel, Heading, IconButton, Input, Text, Tooltip } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { buildCharacterPrompt, characterRemoved, characterSaved, characterUpdated } from 'features/characterPrompt/store/characterPromptSlice';
import { memo } from 'react';
import { PiFloppyDiskBold, PiTrashBold } from 'react-icons/pi';
import { useGetImageDTOQuery } from 'services/api/endpoints/images';
import { skipToken } from '@reduxjs/toolkit/query';
import { CharacterReferenceImage } from './CharacterReferenceImage';

export const CharacterAccordionItem = memo(({ char, index }: any) => {
  const dispatch = useAppDispatch();
  const { data: imageDTO } = useGetImageDTOQuery(char.referenceImageName ?? skipToken);

  return (
    <AccordionItem borderWidth={1} borderRadius="md" borderColor="base.700" mb={4} bg="base.850">
      <AccordionButton p={2} _hover={{ bg: 'base.800' }}>
        <Flex flex="1" alignItems="center" gap={3}>
          <Flex w={10} h={10} bg="base.900" borderRadius="sm" overflow="hidden" alignItems="center" justifyContent="center">
            {imageDTO ? (
              <img src={imageDTO.thumbnail_url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Text fontSize="2xs" color="base.500">No Img</Text>
            )}
          </Flex>
          <Text fontWeight="semibold" noOfLines={1}>{char.name || `Character ${index + 1}`}</Text>
        </Flex>
        <AccordionIcon />
      </AccordionButton>
      
      <AccordionPanel pb={4} display="flex" flexDir="column" gap={5}>
        <Flex justifyContent="space-between" alignItems="center">
          <Button leftIcon={<PiFloppyDiskBold />} size="sm" onClick={() => dispatch(characterSaved(char))}>
            Save to Library
          </Button>
          <IconButton
            size="sm"
            colorScheme="error"
            variant="ghost"
            onClick={() => dispatch(characterRemoved(char.id))}
            aria-label="Delete Character"
            icon={<PiTrashBold />}
          />
        </Flex>

        <CharacterReferenceImage characterId={char.id} imageName={char.referenceImageName} />

        {/* General */}
        <Box p={3} borderWidth={1} borderRadius="md" borderColor="base.800" bg="base.800">
          <Heading size="sm" mb={3} color="base.300">General</Heading>
          <Flex direction="column" gap={3}>
            <FormControl>
              <FormLabel>Name (Optional)</FormLabel>
              <Input size="sm" value={char.name} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { name: e.target.value } }))} placeholder="E.g. Sarah" />
            </FormControl>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Input size="sm" list="genders-list" value={char.gender || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { gender: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Age</FormLabel>
                <Input size="sm" list="ages-list" value={char.age || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { age: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Ethnicity</FormLabel>
                <Input size="sm" list="ethnicities-list" value={char.ethnicity || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { ethnicity: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Skin Tone</FormLabel>
                <Input size="sm" list="skin-tones-list" value={char.skinTone || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { skinTone: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
          </Flex>
        </Box>

        {/* Hair */}
        <Box p={3} borderWidth={1} borderRadius="md" borderColor="base.800" bg="base.800">
          <Heading size="sm" mb={3} color="base.300">Hair</Heading>
          <Flex direction="column" gap={3}>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Hair Color</FormLabel>
                <Input size="sm" list="hair-colors-list" value={char.hairColor || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { hairColor: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Hair Length</FormLabel>
                <Input size="sm" list="hair-lengths-list" value={char.hairLength || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { hairLength: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
            <FormControl>
              <FormLabel>Hair Style</FormLabel>
              <Input size="sm" list="hair-styles-list" value={char.hairStyle || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { hairStyle: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
            <FormControl>
              <FormLabel>Hair Texture</FormLabel>
              <Input size="sm" list="hair-textures-list" value={char.hairTexture || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { hairTexture: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
          </Flex>
        </Box>

        {/* Face & Makeup */}
        <Box p={3} borderWidth={1} borderRadius="md" borderColor="base.800" bg="base.800">
          <Heading size="sm" mb={3} color="base.300">Face & Makeup</Heading>
          <Flex direction="column" gap={3}>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Foundation</FormLabel>
                <Input size="sm" list="foundations-list" value={char.foundation || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { foundation: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Blush</FormLabel>
                <Input size="sm" list="blushes-list" value={char.blush || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { blush: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
            <FormControl>
              <FormLabel>Freckles</FormLabel>
              <Input size="sm" list="freckles-list" value={char.freckles || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { freckles: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Eye Color</FormLabel>
                <Input size="sm" list="eye-colors-list" value={char.eyeColor || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { eyeColor: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Eye Makeup</FormLabel>
                <Input size="sm" list="eye-makeups-list" value={char.eyeMakeup || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { eyeMakeup: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Eye Lashes</FormLabel>
                <Input size="sm" list="eye-lashes-list" value={char.eyeLashes || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { eyeLashes: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Eye Brows</FormLabel>
                <Input size="sm" list="eye-brows-list" value={char.eyeBrows || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { eyeBrows: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Lip Size</FormLabel>
                <Input size="sm" list="lip-sizes-list" value={char.lipSize || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { lipSize: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Lip Makeup</FormLabel>
                <Input size="sm" list="lip-makeups-list" value={char.lipMakeup || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { lipMakeup: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
            <FormControl>
              <FormLabel>Expression</FormLabel>
              <Input size="sm" list="expressions-list" value={char.expression || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { expression: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
          </Flex>
        </Box>

        {/* Outfit & Accessories */}
        <Box p={3} borderWidth={1} borderRadius="md" borderColor="base.800" bg="base.800">
          <Heading size="sm" mb={3} color="base.300">Outfit & Accessories</Heading>
          <Flex direction="column" gap={3}>
            <Flex gap={2}>
              <FormControl>
                <FormLabel>Body Type</FormLabel>
                <Input size="sm" list="body-types-list" value={char.bodyType || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { bodyType: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Body Shape</FormLabel>
                <Input size="sm" list="body-shapes-list" value={char.bodyShape || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { bodyShape: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel>Topwear</FormLabel>
              <Input size="sm" list="topwears-list" value={char.topwear || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { topwear: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
            <FormControl>
              <FormLabel>Middlewear</FormLabel>
              <Input size="sm" list="middlewears-list" value={char.middlewear || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { middlewear: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
            <FormControl>
              <FormLabel>Bottomwear</FormLabel>
              <Input size="sm" list="bottomwears-list" value={char.bottomwear || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { bottomwear: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
            <FormControl>
              <FormLabel>Footwear</FormLabel>
              <Input size="sm" list="footwears-list" value={char.footwear || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { footwear: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>
            <FormControl>
              <FormLabel>Full Bodywear (Overrides separated outfit)</FormLabel>
              <Input size="sm" list="full-bodywears-list" value={char.fullBodywear || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { fullBodywear: e.target.value } }))} placeholder="Select or type..." />
            </FormControl>

            <Flex gap={2}>
              <FormControl>
                <FormLabel>Glasses</FormLabel>
                <Input size="sm" list="glasses-list" value={char.glasses || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { glasses: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Headwear</FormLabel>
                <Input size="sm" list="headwears-list" value={char.headwear || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { headwear: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>

            <Flex direction="column" gap={3}>
              <FormControl>
                <FormLabel>Accessories</FormLabel>
                <Input size="sm" list="accessories-list" value={char.accessories || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { accessories: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Jewelry</FormLabel>
                <Input size="sm" list="jewelry-list" value={char.jewelry || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { jewelry: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Piercings</FormLabel>
                <Input size="sm" list="piercings-list" value={char.piercings || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { piercings: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
              <FormControl>
                <FormLabel>Pose</FormLabel>
                <Input size="sm" list="poses-list" value={char.pose || ''} onChange={(e) => dispatch(characterUpdated({ id: char.id, changes: { pose: e.target.value } }))} placeholder="Select or type..." />
              </FormControl>
            </Flex>
          </Flex>
        </Box>

        {/* Preview */}
        <Box p={3} borderWidth={1} borderRadius="md" borderColor="base.700" bg="base.900">
          <Heading size="xs" mb={2} color="base.400">Generated Prompt</Heading>
          <Text fontSize="sm" color="base.200" fontStyle="italic" wordBreak="break-word">
            {buildCharacterPrompt(char) || 'No features selected.'}
          </Text>
        </Box>
      </AccordionPanel>
    </AccordionItem>
  );
});
CharacterAccordionItem.displayName = 'CharacterAccordionItem';
