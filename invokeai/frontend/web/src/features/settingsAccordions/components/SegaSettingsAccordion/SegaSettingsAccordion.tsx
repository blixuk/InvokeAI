import {
  CompositeNumberInput,
  CompositeSlider,
  Flex,
  FormControl,
  FormLabel,
  StandaloneAccordion,
  Switch,
} from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { InformationalPopover } from 'common/components/InformationalPopover/InformationalPopover';
import {
  selectSegaEnabled,
  selectSegaAlpha,
  setSegaEnabled,
  setSegaAlpha,
  selectIsFlux2,
  selectIsExternal,
} from 'features/controlLayers/store/paramsSlice';
import { useStandaloneAccordionToggle } from 'features/settingsAccordions/hooks/useStandaloneAccordionToggle';
import * as React from 'react';
import { memo, useCallback } from 'react';

const ALPHA_CONSTRAINTS = {
  initial: 1.0,
  min: 0.1,
  max: 4.0,
  step: 0.1,
  fineStep: 0.05,
};

export const SegaSettingsAccordion = memo(() => {
  const dispatch = useAppDispatch();
  const segaEnabled = useAppSelector(selectSegaEnabled);
  const segaAlpha = useAppSelector(selectSegaAlpha);
  const isFlux2 = useAppSelector(selectIsFlux2);
  const isExternal = useAppSelector(selectIsExternal);

  const { isOpen, onToggle } = useStandaloneAccordionToggle({
    id: 'sega-settings-accordion',
    defaultIsOpen: false,
  });

  const handleEnabledChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSegaEnabled(e.target.checked));
    },
    [dispatch]
  );

  const handleAlphaChange = useCallback(
    (v: number) => {
      dispatch(setSegaAlpha(v));
    },
    [dispatch]
  );

  if (isExternal || !isFlux2) {
    return null;
  }

  const badges = segaEnabled ? ['Active', `α: ${segaAlpha}`] : [];

  return (
    <StandaloneAccordion
      label="Spectral Energy Attention (SEGA)"
      badges={badges}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Flex pt={4} px={4} pb={4} w="full" h="full" flexDir="column" gap={4} data-testid="sega-settings-accordion">
        <FormControl>
          <Flex justify="space-between" align="center" w="full">
            <InformationalPopover feature="segaExtrapolation">
              <FormLabel mb={0} cursor="pointer">
                Enable SEGA Extrapolation
              </FormLabel>
            </InformationalPopover>
            <Switch isChecked={segaEnabled} onChange={handleEnabledChange} />
          </Flex>
        </FormControl>

        {segaEnabled && (
          <FormControl>
            <FormLabel>Extrapolation Scale (Alpha)</FormLabel>
            <CompositeSlider
              value={segaAlpha}
              min={ALPHA_CONSTRAINTS.min}
              max={ALPHA_CONSTRAINTS.max}
              step={ALPHA_CONSTRAINTS.step}
              fineStep={ALPHA_CONSTRAINTS.fineStep}
              onChange={handleAlphaChange}
            />
            <CompositeNumberInput
              value={segaAlpha}
              min={ALPHA_CONSTRAINTS.min}
              max={ALPHA_CONSTRAINTS.max}
              step={ALPHA_CONSTRAINTS.step}
              fineStep={ALPHA_CONSTRAINTS.fineStep}
              onChange={handleAlphaChange}
            />
          </FormControl>
        )}
      </Flex>
    </StandaloneAccordion>
  );
});

SegaSettingsAccordion.displayName = 'SegaSettingsAccordion';
