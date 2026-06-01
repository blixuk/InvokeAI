import {
  Collapse,
  CompositeNumberInput,
  CompositeSlider,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Combobox,
  ComboboxOnChange,
  ComboboxOption,
} from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { InformationalPopover } from 'common/components/InformationalPopover/InformationalPopover';
import {
  selectPiDDecodeSharpness,
  selectPiDDecodeSteps,
  selectUsePiDDecode,
  selectPiDDecodeTextEncoder,
  selectPiDDecodeModelVariant,
  selectPiDDecodeScale,
  setPiDDecodeSharpness,
  setPiDDecodeSteps,
  setPiDDecodeTextEncoder,
  setPiDDecodeModelVariant,
  setPiDDecodeScale,
  usePiDDecodeToggled,
} from 'features/controlLayers/store/paramsSlice';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const STEP_CONSTRAINTS = {
  initial: 4,
  min: 1,
  max: 20,
  step: 1,
};

const SHARPNESS_CONSTRAINTS = {
  initial: 0.8,
  min: 0.0,
  max: 2.0,
  step: 0.1,
  fineStep: 0.05,
};

export const ParamPiDDecode = memo(() => {
  const usePiDDecode = useAppSelector(selectUsePiDDecode);
  const steps = useAppSelector(selectPiDDecodeSteps);
  const sharpness = useAppSelector(selectPiDDecodeSharpness);
  const textEncoder = useAppSelector(selectPiDDecodeTextEncoder);
  const modelVariant = useAppSelector(selectPiDDecodeModelVariant);
  const scale = useAppSelector(selectPiDDecodeScale);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleToggle = useCallback(() => {
    dispatch(usePiDDecodeToggled());
  }, [dispatch]);

  const handleSwitchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(usePiDDecodeToggled());
    },
    [dispatch]
  );

  const handleStepsChange = useCallback(
    (v: number) => {
      dispatch(setPiDDecodeSteps(v));
    },
    [dispatch]
  );

  const handleSharpnessChange = useCallback(
    (v: number) => {
      dispatch(setPiDDecodeSharpness(v));
    },
    [dispatch]
  );

  const textEncoderOptions = useMemo<ComboboxOption[]>(
    () => [
      { value: 'gemma-2-2b-it', label: 'Gemma 2 2B (Standard)' },
      { value: 'gemma-2-2b-it-abliterated', label: 'Gemma 2 2B (Abliterated)' },
    ],
    []
  );

  const modelVariantOptions = useMemo<ComboboxOption[]>(
    () => [
      { value: '2k', label: '2K Resolution (res2k_sr4x)' },
      { value: '4k', label: '4K Resolution (res2kto4k_sr4x)' },
    ],
    []
  );

  const scaleOptions = useMemo<ComboboxOption[]>(
    () => [
      { value: '1', label: '1x (No upscale)' },
      { value: '2', label: '2x upscale' },
      { value: '4', label: '4x upscale (Default)' },
      { value: '8', label: '8x upscale' },
    ],
    []
  );

  const handleTextEncoderChange = useCallback<ComboboxOnChange>(
    (v) => {
      if (v?.value === 'gemma-2-2b-it' || v?.value === 'gemma-2-2b-it-abliterated') {
        dispatch(setPiDDecodeTextEncoder(v.value));
      }
    },
    [dispatch]
  );

  const handleModelVariantChange = useCallback<ComboboxOnChange>(
    (v) => {
      if (v?.value === '2k' || v?.value === '4k') {
        dispatch(setPiDDecodeModelVariant(v.value));
      }
    },
    [dispatch]
  );

  const handleScaleChange = useCallback<ComboboxOnChange>(
    (v) => {
      const val = parseInt(v?.value ?? '4');
      if (!isNaN(val)) {
        dispatch(setPiDDecodeScale(val));
      }
    },
    [dispatch]
  );

  const activeTextEncoderOption = useMemo(
    () => textEncoderOptions.find((o) => o.value === textEncoder),
    [textEncoderOptions, textEncoder]
  );

  const activeModelVariantOption = useMemo(
    () => modelVariantOptions.find((o) => o.value === modelVariant),
    [modelVariantOptions, modelVariant]
  );

  const activeScaleOption = useMemo(
    () => scaleOptions.find((o) => o.value === String(scale)),
    [scaleOptions, scale]
  );

  return (
    <Flex flexDirection="column" gap={4} width="full">
      <FormControl w="full">
        <Flex justifyContent="space-between" alignItems="center" w="full">
          <InformationalPopover feature="usePiDDecode">
            <FormLabel m={0} cursor="pointer" onClick={handleToggle}>
              Pixel Diffusion Decoder (PiD)
            </FormLabel>
          </InformationalPopover>
          <Switch isChecked={usePiDDecode} onChange={handleSwitchChange} />
        </Flex>
      </FormControl>

      <Collapse in={usePiDDecode}>
        <Flex
          flexDirection="column"
          gap={4}
          p={3}
          borderRadius="base"
          bg="background.50"
          border="1px solid"
          borderColor="border.50"
          width="full"
        >
          <FormControl>
            <FormLabel m={0}>PiD Diffusion Steps</FormLabel>
            <CompositeSlider
              value={steps}
              defaultValue={STEP_CONSTRAINTS.initial}
              min={STEP_CONSTRAINTS.min}
              max={STEP_CONSTRAINTS.max}
              step={STEP_CONSTRAINTS.step}
              onChange={handleStepsChange}
            />
            <CompositeNumberInput
              value={steps}
              defaultValue={STEP_CONSTRAINTS.initial}
              min={STEP_CONSTRAINTS.min}
              max={STEP_CONSTRAINTS.max}
              step={STEP_CONSTRAINTS.step}
              onChange={handleStepsChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel m={0}>Detail Sharpness</FormLabel>
            <CompositeSlider
              value={sharpness}
              defaultValue={SHARPNESS_CONSTRAINTS.initial}
              min={SHARPNESS_CONSTRAINTS.min}
              max={SHARPNESS_CONSTRAINTS.max}
              step={SHARPNESS_CONSTRAINTS.step}
              fineStep={SHARPNESS_CONSTRAINTS.fineStep}
              onChange={handleSharpnessChange}
            />
            <CompositeNumberInput
              value={sharpness}
              defaultValue={SHARPNESS_CONSTRAINTS.initial}
              min={SHARPNESS_CONSTRAINTS.min}
              max={SHARPNESS_CONSTRAINTS.max}
              step={SHARPNESS_CONSTRAINTS.step}
              fineStep={SHARPNESS_CONSTRAINTS.fineStep}
              onChange={handleSharpnessChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel m={0}>Text Encoder Variant</FormLabel>
            <Combobox
              value={activeTextEncoderOption}
              options={textEncoderOptions}
              onChange={handleTextEncoderChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel m={0}>Model Resolution Variant</FormLabel>
            <Combobox
              value={activeModelVariantOption}
              options={modelVariantOptions}
              onChange={handleModelVariantChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel m={0}>Upscale Scale Factor</FormLabel>
            <Combobox
              value={activeScaleOption}
              options={scaleOptions}
              onChange={handleScaleChange}
            />
          </FormControl>
        </Flex>
      </Collapse>
    </Flex>
  );
});

ParamPiDDecode.displayName = 'ParamPiDDecode';
