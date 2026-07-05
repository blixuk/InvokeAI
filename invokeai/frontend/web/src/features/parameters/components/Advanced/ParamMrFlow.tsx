import { Collapse, CompositeNumberInput, CompositeSlider, Flex, FormControl, FormLabel, Switch } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { InformationalPopover } from 'common/components/InformationalPopover/InformationalPopover';
import {
  mrFlowToggled,
  selectMrFlowEnabled,
  selectMrFlowHighResSteps,
  selectMrFlowLowResSteps,
  selectMrFlowSigma,
  setMrFlowHighResSteps,
  setMrFlowLowResSteps,
  setMrFlowSigma,
} from 'features/controlLayers/store/paramsSlice';
import { memo, useCallback } from 'react';

const LOW_RES_STEPS_CONSTRAINTS = {
  initial: 12,
  min: 1,
  max: 50,
  step: 1,
};

const HIGH_RES_STEPS_CONSTRAINTS = {
  initial: 1,
  min: 1,
  max: 10,
  step: 1,
};

const SIGMA_CONSTRAINTS = {
  initial: 0.12,
  min: 0.01,
  max: 1.0,
  step: 0.01,
  fineStep: 0.01,
};

export const ParamMrFlow = memo(() => {
  const mrFlowEnabled = useAppSelector(selectMrFlowEnabled);
  const lowResSteps = useAppSelector(selectMrFlowLowResSteps);
  const highResSteps = useAppSelector(selectMrFlowHighResSteps);
  const sigma = useAppSelector(selectMrFlowSigma);

  const dispatch = useAppDispatch();

  const handleToggle = useCallback(() => {
    dispatch(mrFlowToggled());
  }, [dispatch]);

  const handleLowResStepsChange = useCallback(
    (v: number) => {
      dispatch(setMrFlowLowResSteps(v));
    },
    [dispatch]
  );

  const handleHighResStepsChange = useCallback(
    (v: number) => {
      dispatch(setMrFlowHighResSteps(v));
    },
    [dispatch]
  );

  const handleSigmaChange = useCallback(
    (v: number) => {
      dispatch(setMrFlowSigma(v));
    },
    [dispatch]
  );

  return (
    <Flex flexDir="column" gap={4}>
      <FormControl>
        <InformationalPopover feature="mrFlow">
          <FormLabel flexGrow={1} m={0}>
            MrFlow Acceleration
          </FormLabel>
        </InformationalPopover>
        <Switch isChecked={mrFlowEnabled} onChange={handleToggle} />
      </FormControl>

      <Collapse in={mrFlowEnabled} animateOpacity>
        <Flex flexDir="column" gap={4} pt={2} pb={2}>
          <FormControl>
            <FormLabel>Low-Res</FormLabel>
            <CompositeSlider
              value={lowResSteps}
              onChange={handleLowResStepsChange}
              min={LOW_RES_STEPS_CONSTRAINTS.min}
              max={LOW_RES_STEPS_CONSTRAINTS.max}
              step={LOW_RES_STEPS_CONSTRAINTS.step}
              marks
            />
            <CompositeNumberInput
              value={lowResSteps}
              onChange={handleLowResStepsChange}
              min={LOW_RES_STEPS_CONSTRAINTS.min}
              max={LOW_RES_STEPS_CONSTRAINTS.max}
              step={LOW_RES_STEPS_CONSTRAINTS.step}
            />
          </FormControl>

          <FormControl>
            <FormLabel>High-Res</FormLabel>
            <CompositeSlider
              value={highResSteps}
              onChange={handleHighResStepsChange}
              min={HIGH_RES_STEPS_CONSTRAINTS.min}
              max={HIGH_RES_STEPS_CONSTRAINTS.max}
              step={HIGH_RES_STEPS_CONSTRAINTS.step}
              marks
            />
            <CompositeNumberInput
              value={highResSteps}
              onChange={handleHighResStepsChange}
              min={HIGH_RES_STEPS_CONSTRAINTS.min}
              max={HIGH_RES_STEPS_CONSTRAINTS.max}
              step={HIGH_RES_STEPS_CONSTRAINTS.step}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Sigma</FormLabel>
            <CompositeSlider
              value={sigma}
              onChange={handleSigmaChange}
              min={SIGMA_CONSTRAINTS.min}
              max={SIGMA_CONSTRAINTS.max}
              step={SIGMA_CONSTRAINTS.step}
              fineStep={SIGMA_CONSTRAINTS.fineStep}
            />
            <CompositeNumberInput
              value={sigma}
              onChange={handleSigmaChange}
              min={SIGMA_CONSTRAINTS.min}
              max={SIGMA_CONSTRAINTS.max}
              step={SIGMA_CONSTRAINTS.step}
              fineStep={SIGMA_CONSTRAINTS.fineStep}
            />
          </FormControl>
        </Flex>
      </Collapse>
    </Flex>
  );
});

ParamMrFlow.displayName = 'ParamMrFlow';
