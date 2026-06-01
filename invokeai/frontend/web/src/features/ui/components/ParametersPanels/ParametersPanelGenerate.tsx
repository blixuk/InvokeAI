import {
  Box,
  Flex,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { overlayScrollbarsParams } from 'common/components/OverlayScrollbars/constants';
import {
  selectIsCogView4,
  selectIsExternal,
  selectIsSDXL,
  selectIsFlux2,
  selectIsFLUX,
} from 'features/controlLayers/store/paramsSlice';
import { Prompts } from 'features/parameters/components/Prompts/Prompts';
import { ADetailerSettingsAccordion } from 'features/settingsAccordions/components/ADetailerSettingsAccordion/ADetailerSettingsAccordion';
import { AdvancedSettingsAccordion } from 'features/settingsAccordions/components/AdvancedSettingsAccordion/AdvancedSettingsAccordion';
import { ExternalSettingsAccordion } from 'features/settingsAccordions/components/ExternalSettingsAccordion/ExternalSettingsAccordion';
import { GenerationSettingsAccordion } from 'features/settingsAccordions/components/GenerationSettingsAccordion/GenerationSettingsAccordion';
import { SegaSettingsAccordion } from 'features/settingsAccordions/components/SegaSettingsAccordion/SegaSettingsAccordion';
import { PidSettingsAccordion } from 'features/settingsAccordions/components/PidSettingsAccordion/PidSettingsAccordion';
import { GenerateTabImageSettingsAccordion } from 'features/settingsAccordions/components/ImageSettingsAccordion/GenerateTabImageSettingsAccordion';
import { RefinerSettingsAccordion } from 'features/settingsAccordions/components/RefinerSettingsAccordion/RefinerSettingsAccordion';
import { StylePresetMenu } from 'features/stylePresets/components/StylePresetMenu';
import { StylePresetMenuTrigger } from 'features/stylePresets/components/StylePresetMenuTrigger';
import { $isStylePresetsMenuOpen } from 'features/stylePresets/store/stylePresetSlice';
import {
  addOptionalModule,
  removeOptionalModule,
} from 'features/ui/store/uiSlice';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { CSSProperties } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { PiPlusBold, PiXBold } from 'react-icons/pi';

const overlayScrollbarsStyles: CSSProperties = {
  height: '100%',
  width: '100%',
};

interface OptionalModuleWrapperProps {
  id: string;
  children: React.ReactNode;
}

const OptionalModuleWrapper = memo(({ id, children }: OptionalModuleWrapperProps) => {
  const dispatch = useAppDispatch();
  const handleRemove = useCallback(() => {
    dispatch(removeOptionalModule(id));
  }, [dispatch, id]);

  return (
    <Box position="relative" w="full" role="group">
      {children}
      <IconButton
        size="xs"
        icon={<PiXBold />}
        aria-label="Remove module"
        onClick={handleRemove}
        position="absolute"
        top="10px"
        right="42px"
        zIndex={2}
        variant="ghost"
        color="base.400"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        _hover={{ color: 'base.100', bg: 'rgba(255, 255, 255, 0.08)' }}
        borderRadius="md"
        h="20px"
        minW="20px"
        w="20px"
        transition="opacity 0.2s ease-in-out"
      />
    </Box>
  );
});
OptionalModuleWrapper.displayName = 'OptionalModuleWrapper';

export const ParametersPanelGenerate = memo(() => {
  const dispatch = useAppDispatch();
  const isSDXL = useAppSelector(selectIsSDXL);
  const isCogview4 = useAppSelector(selectIsCogView4);
  const isExternal = useAppSelector(selectIsExternal);
  const isFlux2 = useAppSelector(selectIsFlux2);
  const isFLUX = useAppSelector(selectIsFLUX);
  const isStylePresetsMenuOpen = useStore($isStylePresetsMenuOpen);

  const activeOptionalModuleIds = useAppSelector((state) => state.ui.activeOptionalModuleIds);

  const modules = useMemo(() => [
    { id: 'adetailer', label: 'Detailer (ADetailer)', isCompatible: true },
    { id: 'sega', label: 'Spectral Energy Attention (SEGA)', isCompatible: isFlux2 },
    { id: 'pid', label: 'Pixel Diffusion Decoder (PiD)', isCompatible: isFLUX || isFlux2 },
    { id: 'refiner', label: 'Refiner Settings (SDXL)', isCompatible: isSDXL },
    { id: 'advanced', label: 'Advanced Options', isCompatible: !isCogview4 },
  ], [isFlux2, isFLUX, isSDXL, isCogview4]);

  const availableModules = useMemo(() => {
    return modules.filter((m) => m.isCompatible && !activeOptionalModuleIds.includes(m.id));
  }, [modules, activeOptionalModuleIds]);

  return (
    <Flex w="full" h="full" flexDir="column" gap={2}>
      <StylePresetMenuTrigger />
      <Flex w="full" h="full" position="relative">
        <Box position="absolute" top={0} left={0} right={0} bottom={0}>
          {isStylePresetsMenuOpen && (
            <OverlayScrollbarsComponent defer style={overlayScrollbarsStyles} options={overlayScrollbarsParams.options}>
              <Flex gap={2} flexDirection="column" h="full" w="full">
                <StylePresetMenu />
              </Flex>
            </OverlayScrollbarsComponent>
          )}
          <OverlayScrollbarsComponent defer style={overlayScrollbarsStyles} options={overlayScrollbarsParams.options}>
            <Flex gap={2} flexDirection="column" h="full" w="full" pb={4}>
              <Prompts />
              <GenerateTabImageSettingsAccordion />
              <GenerationSettingsAccordion />

              {/* Optional Modules */}
              {activeOptionalModuleIds.includes('sega') && (
                <OptionalModuleWrapper id="sega">
                  <SegaSettingsAccordion />
                </OptionalModuleWrapper>
              )}

              {activeOptionalModuleIds.includes('pid') && (
                <OptionalModuleWrapper id="pid">
                  <PidSettingsAccordion />
                </OptionalModuleWrapper>
              )}

              {activeOptionalModuleIds.includes('adetailer') && (
                <OptionalModuleWrapper id="adetailer">
                  <ADetailerSettingsAccordion />
                </OptionalModuleWrapper>
              )}

              {isSDXL && activeOptionalModuleIds.includes('refiner') && (
                <OptionalModuleWrapper id="refiner">
                  <RefinerSettingsAccordion />
                </OptionalModuleWrapper>
              )}

              {!isCogview4 && !isExternal && activeOptionalModuleIds.includes('advanced') && (
                <OptionalModuleWrapper id="advanced">
                  <AdvancedSettingsAccordion />
                </OptionalModuleWrapper>
              )}

              {isExternal && <ExternalSettingsAccordion />}

              {/* Add optional module catalog button */}
              {!isExternal && (
                <Box px={1} pt={2}>
                  {availableModules.length > 0 ? (
                    <Menu>
                      <MenuButton
                        as={Button}
                        leftIcon={<PiPlusBold />}
                        size="sm"
                        variant="outline"
                        colorScheme="base"
                        w="full"
                      >
                        Add Generation Module
                      </MenuButton>
                      <MenuList zIndex={3}>
                        {availableModules.map((module) => (
                          <MenuItem
                            key={module.id}
                            icon={<PiPlusBold />}
                            onClick={() => dispatch(addOptionalModule(module.id))}
                          >
                            {module.label}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  ) : (
                    <Button
                      leftIcon={<PiPlusBold />}
                      size="sm"
                      variant="outline"
                      colorScheme="base"
                      isDisabled
                      w="full"
                    >
                      All Modules Added
                    </Button>
                  )}
                </Box>
              )}
            </Flex>
          </OverlayScrollbarsComponent>
        </Box>
      </Flex>
    </Flex>
  );
});

ParametersPanelGenerate.displayName = 'ParametersPanelGenerate';
