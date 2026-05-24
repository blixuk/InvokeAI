import { Box, Flex, Grid, GridItem, Heading, Spacer } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useListStylePresetsQuery } from 'services/api/endpoints/stylePresets';

import { StylePresetCreateButton } from './StylePresetCreateButton';
import { StylePresetExportButton } from './StylePresetExportButton';
import { StylePresetImportButton } from './StylePresetImportButton';
import { StylePresetListItem } from './StylePresetListItem';

export const TemplatesTab = memo(() => {
  const { t } = useTranslation();
  const { data: stylePresets = [] } = useListStylePresetsQuery();

  const userPresets = stylePresets.filter((p) => p.type === 'user');
  const defaultPresets = stylePresets.filter((p) => p.type === 'default');

  return (
    <Box position="relative" w="full" h="full" overflow="auto" p={8}>
      <Flex flexDir="column" gap={6} maxW="container.xl" mx="auto">
        <Flex w="full" alignItems="center">
          <Heading size="lg">{t('stylePresets.choosePromptTemplate', 'Prompt Templates')}</Heading>
          <Spacer />
          <Flex gap={2}>
            <StylePresetImportButton />
            <StylePresetExportButton />
            <StylePresetCreateButton />
          </Flex>
        </Flex>

        {userPresets.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color="base.300">
              {t('stylePresets.myTemplates', 'My Templates')}
            </Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {userPresets.map((preset) => (
                <GridItem key={preset.id} bg="base.800" borderRadius="base" borderWidth={1} borderColor="base.700">
                  <StylePresetListItem preset={preset} />
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        <Box>
          <Heading size="md" mb={4} color="base.300">
            {t('stylePresets.defaultTemplates', 'Default Templates')}
          </Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
            {defaultPresets.map((preset) => (
              <GridItem key={preset.id} bg="base.800" borderRadius="base" borderWidth={1} borderColor="base.700">
                <StylePresetListItem preset={preset} />
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
});

TemplatesTab.displayName = 'TemplatesTab';
