import { Flex, StandaloneAccordion } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import {
  selectZImageSeedVarianceEnabled,
  selectZImageSeedVarianceStrength,
} from 'features/controlLayers/store/paramsSlice';
import ParamZImageSeedVarianceEnabled from 'features/parameters/components/SeedVariance/ParamZImageSeedVarianceEnabled';
import ParamZImageSeedVarianceRandomizePercent from 'features/parameters/components/SeedVariance/ParamZImageSeedVarianceRandomizePercent';
import ParamZImageSeedVarianceStrength from 'features/parameters/components/SeedVariance/ParamZImageSeedVarianceStrength';
import { useStandaloneAccordionToggle } from 'features/settingsAccordions/hooks/useStandaloneAccordionToggle';
import { memo } from 'react';

export const SeedVarianceSettingsAccordion = memo(() => {
  const enabled = useAppSelector(selectZImageSeedVarianceEnabled);
  const strength = useAppSelector(selectZImageSeedVarianceStrength);

  const { isOpen, onToggle } = useStandaloneAccordionToggle({
    id: 'seed-variance-settings-accordion',
    defaultIsOpen: false,
  });

  const badges = enabled ? ['Active', `Strength: ${strength}`] : [];

  return (
    <StandaloneAccordion
      label="Seed Variation (Slerp)"
      badges={badges}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Flex pt={4} px={4} pb={4} w="full" h="full" flexDir="column" gap={4} data-testid="seed-variance-settings-accordion">
        <ParamZImageSeedVarianceEnabled />
        {enabled && (
          <>
            <ParamZImageSeedVarianceStrength />
            <ParamZImageSeedVarianceRandomizePercent />
          </>
        )}
      </Flex>
    </StandaloneAccordion>
  );
});

SeedVarianceSettingsAccordion.displayName = 'SeedVarianceSettingsAccordion';
