import { Box, Button, Divider, Flex, Icon, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { overlayScrollbarsParams } from 'common/components/OverlayScrollbars/constants';
import { selectGallerySelectedTags } from 'features/gallery/store/gallerySelectors';
import { toggleTag } from 'features/gallery/store/gallerySlice';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { CSSProperties } from 'react';
import { memo, useCallback } from 'react';
import { PiCaretDownBold, PiCaretUpBold, PiTagBold } from 'react-icons/pi';
import { useGetTagsQuery } from 'services/api/endpoints/images';

const overlayScrollbarsStyles: CSSProperties = {
  height: '100%',
  width: '100%',
};

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export const TagsList = memo(({ isOpen, onToggle }: Props) => {
  const { data: tags } = useGetTagsQuery(undefined);
  const selectedTags = useAppSelector(selectGallerySelectedTags);

  return (
    <Flex flexDir="column" w="full" h="full" gap={2} mt={2}>
      <Divider />
      <Flex alignItems="center" justifyContent="space-between" w="full">
        <Flex flexGrow={1} flexBasis={0}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            leftIcon={isOpen ? <PiCaretDownBold /> : <PiCaretUpBold />}
          >
            Tags
          </Button>
        </Flex>
      </Flex>
      <Box position="relative" w="full" h="full">
        <Box position="absolute" top={0} right={0} bottom={0} left={0}>
          <OverlayScrollbarsComponent
            style={overlayScrollbarsStyles}
            options={overlayScrollbarsParams.options}
          >
            <Flex flexDir="column" gap={1}>
              {tags?.map((tag) => (
                <TagItem
                  key={tag}
                  name={tag}
                  isSelected={selectedTags.includes(tag)}
                />
              ))}
              {(!tags || tags.length === 0) && (
                <Text variant="subtext" px={2} py={1} fontSize="sm">
                  No tags found.
                </Text>
              )}
            </Flex>
          </OverlayScrollbarsComponent>
        </Box>
      </Box>
    </Flex>
  );
});

TagsList.displayName = 'TagsList';

const TagItem = memo(({ name, isSelected }: { name: string; isSelected: boolean }) => {
  const dispatch = useAppDispatch();
  const onClick = useCallback(() => dispatch(toggleTag(name)), [dispatch, name]);
  return (
    <Flex
      alignItems="center"
      p={2}
      gap={2}
      borderRadius="base"
      cursor="pointer"
      bg={isSelected ? 'invokeBlue.alpha.200' : 'transparent'}
      _hover={{ bg: 'invokeBlue.alpha.300' }}
      onClick={onClick}
    >
      <Icon as={PiTagBold} color={isSelected ? 'invokeBlue.500' : 'base.400'} />
      <Text fontSize="sm">{name}</Text>
    </Flex>
  );
});
TagItem.displayName = 'TagItem';
