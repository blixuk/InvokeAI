import {
  CompositeNumberInput,
  CompositeSlider,
  Flex,
  FormControl,
  FormLabel,
  Select,
  StandaloneAccordion,
  Switch,
  Textarea,
} from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import type { ADetailerState } from 'features/parameters/store/adetailerSlice';
import {
  selectADetailerSlice,
  setADetailerDenoisingStrength,
  setADetailerEnabled,
  setADetailerMaskBlur,
  setADetailerMinConfidence,
  setADetailerModel,
  setADetailerPadding,
  setADetailerPrompt,
  setADetailerSaveBeforeImage,
} from 'features/parameters/store/adetailerSlice';
import { useStandaloneAccordionToggle } from 'features/settingsAccordions/hooks/useStandaloneAccordionToggle';
import type { ChangeEvent } from 'react';
import { memo, useCallback } from 'react';

export const ADetailerSettingsAccordion = memo(() => {
  const dispatch = useAppDispatch();
  const adetailer = useAppSelector(selectADetailerSlice);

  const { isOpen, onToggle } = useStandaloneAccordionToggle({
    id: 'adetailer-settings',
    defaultIsOpen: false,
  });

  const handleEnabledChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setADetailerEnabled(e.target.checked));
    },
    [dispatch]
  );

  const handleModelChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      dispatch(setADetailerModel(e.target.value as ADetailerState['detectorModel']));
    },
    [dispatch]
  );

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(setADetailerPrompt(e.target.value));
    },
    [dispatch]
  );

  const handleDenoisingStrengthChange = useCallback(
    (v: number) => {
      dispatch(setADetailerDenoisingStrength(v));
    },
    [dispatch]
  );

  const handlePaddingChange = useCallback(
    (v: number) => {
      dispatch(setADetailerPadding(v));
    },
    [dispatch]
  );

  const handleMaskBlurChange = useCallback(
    (v: number) => {
      dispatch(setADetailerMaskBlur(v));
    },
    [dispatch]
  );

  const handleMinConfidenceChange = useCallback(
    (v: number) => {
      dispatch(setADetailerMinConfidence(v));
    },
    [dispatch]
  );

  const handleSaveBeforeImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setADetailerSaveBeforeImage(e.target.checked));
    },
    [dispatch]
  );

  const badges = adetailer.isEnabled ? ['Enabled', adetailer.detectorModel.replace('_', ' ')] : [];

  return (
    <StandaloneAccordion
      label="Detailer"
      badges={badges}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Flex pt={4} px={4} pb={4} w="full" h="full" flexDir="column" gap={4} data-testid="adetailer-settings-accordion">
        <FormControl>
          <Flex justify="space-between" align="center" w="full">
            <FormLabel mb={0}>Enable Detailer</FormLabel>
            <Switch isChecked={adetailer.isEnabled} onChange={handleEnabledChange} />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex justify="space-between" align="center" w="full">
            <FormLabel mb={0}>Save Before/After Images</FormLabel>
            <Switch isChecked={adetailer.saveBeforeImage} onChange={handleSaveBeforeImageChange} />
          </Flex>
        </FormControl>

        {adetailer.isEnabled && (
          <Flex flexDir="column" gap={4}>
            <FormControl>
              <FormLabel>Detection Model</FormLabel>
              <Select value={adetailer.detectorModel} onChange={handleModelChange}>
                <option value="mediapipe_face">Face (MediaPipe Mesh)</option>
                <option value="yolov8_face">Face (YOLOv8)</option>
                <option value="yolov8_hand">Hand (YOLOv8)</option>
                <option value="yolov8_person">Person (YOLOv8)</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Denoising Strength</FormLabel>
              <CompositeSlider
                value={adetailer.denoisingStrength}
                min={0.05}
                max={0.95}
                step={0.05}
                onChange={handleDenoisingStrengthChange}
              />
              <CompositeNumberInput
                value={adetailer.denoisingStrength}
                min={0.05}
                max={0.95}
                step={0.05}
                onChange={handleDenoisingStrengthChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Detailer Prompt (Optional)</FormLabel>
              <Textarea
                placeholder="Leave empty to reuse generation prompt, or enter detail-specific prompts (e.g. 'highly detailed face, realistic eyes')"
                value={adetailer.prompt}
                onChange={handlePromptChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Padding (Pixels)</FormLabel>
              <CompositeSlider
                value={adetailer.padding}
                min={0}
                max={128}
                step={8}
                onChange={handlePaddingChange}
              />
              <CompositeNumberInput
                value={adetailer.padding}
                min={0}
                max={128}
                step={8}
                onChange={handlePaddingChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Mask Blur (Pixels)</FormLabel>
              <CompositeSlider
                value={adetailer.maskBlur}
                min={0}
                max={64}
                step={1}
                onChange={handleMaskBlurChange}
              />
              <CompositeNumberInput
                value={adetailer.maskBlur}
                min={0}
                max={64}
                step={1}
                onChange={handleMaskBlurChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Min Confidence</FormLabel>
              <CompositeSlider
                value={adetailer.minConfidence}
                min={0.1}
                max={0.9}
                step={0.05}
                onChange={handleMinConfidenceChange}
              />
              <CompositeNumberInput
                value={adetailer.minConfidence}
                min={0.1}
                max={0.9}
                step={0.05}
                onChange={handleMinConfidenceChange}
              />
            </FormControl>
          </Flex>
        )}
      </Flex>
    </StandaloneAccordion>
  );
});

ADetailerSettingsAccordion.displayName = 'ADetailerSettingsAccordion';
