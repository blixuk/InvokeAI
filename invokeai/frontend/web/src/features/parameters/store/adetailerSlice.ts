import type { PayloadAction, Selector } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { RootState } from 'app/store/store';
import type { SliceConfig } from 'app/store/types';
import { isPlainObject } from 'es-toolkit';
import { assert } from 'tsafe';
import z from 'zod';

const zADetailerState = z.object({
  _version: z.literal(2),
  isEnabled: z.boolean(),
  detectorModel: z.string(),
  denoisingStrength: z.number(),
  prompt: z.string(),
  padding: z.number(),
  maskBlur: z.number(),
  minConfidence: z.number(),
  saveBeforeImage: z.boolean(),
});

export type ADetailerState = z.infer<typeof zADetailerState>;

const modelDefaults: Record<
  string,
  { denoisingStrength: number; padding: number; maskBlur: number; minConfidence: number }
> = {
  mediapipe_face: {
    denoisingStrength: 0.35,
    padding: 24,
    maskBlur: 4,
    minConfidence: 0.5,
  },
  yolov8_face: {
    denoisingStrength: 0.45,
    padding: 32,
    maskBlur: 4,
    minConfidence: 0.5,
  },
  yolov8_hand: {
    denoisingStrength: 0.55,
    padding: 48,
    maskBlur: 8,
    minConfidence: 0.4,
  },
  yolov8_person: {
    denoisingStrength: 0.3,
    padding: 16,
    maskBlur: 12,
    minConfidence: 0.5,
  },
};

const getInitialState = (): ADetailerState => ({
  _version: 2,
  isEnabled: false,
  detectorModel: 'mediapipe_face',
  denoisingStrength: 0.35,
  prompt: '',
  padding: 24,
  maskBlur: 4,
  minConfidence: 0.5,
  saveBeforeImage: false,
});

const slice = createSlice({
  name: 'adetailer',
  initialState: getInitialState(),
  reducers: {
    setADetailerEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    setADetailerModel: (state, action: PayloadAction<string>) => {
      state.detectorModel = action.payload;
      const defaults = modelDefaults[action.payload] ?? {
        denoisingStrength: 0.35,
        padding: 32,
        maskBlur: 4,
        minConfidence: 0.5,
      };
      state.denoisingStrength = defaults.denoisingStrength;
      state.padding = defaults.padding;
      state.maskBlur = defaults.maskBlur;
      state.minConfidence = defaults.minConfidence;
    },
    setADetailerDenoisingStrength: (state, action: PayloadAction<number>) => {
      state.denoisingStrength = action.payload;
    },
    setADetailerPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    setADetailerPadding: (state, action: PayloadAction<number>) => {
      state.padding = action.payload;
    },
    setADetailerMaskBlur: (state, action: PayloadAction<number>) => {
      state.maskBlur = action.payload;
    },
    setADetailerMinConfidence: (state, action: PayloadAction<number>) => {
      state.minConfidence = action.payload;
    },
    setADetailerSaveBeforeImage: (state, action: PayloadAction<boolean>) => {
      state.saveBeforeImage = action.payload;
    },
  },
});

export const {
  setADetailerEnabled,
  setADetailerModel,
  setADetailerDenoisingStrength,
  setADetailerPrompt,
  setADetailerPadding,
  setADetailerMaskBlur,
  setADetailerMinConfidence,
  setADetailerSaveBeforeImage,
} = slice.actions;

export const adetailerSliceConfig: SliceConfig<typeof slice> = {
  slice,
  schema: zADetailerState,
  getInitialState,
  persistConfig: {
    migrate: (state) => {
      assert(isPlainObject(state));
      if (!('_version' in state)) {
        state._version = 1;
      }
      if (state._version === 1) {
        state.saveBeforeImage = false;
        state._version = 2;
      }
      return zADetailerState.parse(state);
    },
  },
};

export const selectADetailerSlice = (state: RootState) => state.adetailer;
const createADetailerSelector = <T>(selector: Selector<ADetailerState, T>) => createSelector(selectADetailerSlice, selector);
export const selectADetailerEnabled = createADetailerSelector((adetailer) => adetailer.isEnabled);
export const selectADetailerModel = createADetailerSelector((adetailer) => adetailer.detectorModel);
export const selectADetailerDenoisingStrength = createADetailerSelector((adetailer) => adetailer.denoisingStrength);
export const selectADetailerPrompt = createADetailerSelector((adetailer) => adetailer.prompt);
export const selectADetailerPadding = createADetailerSelector((adetailer) => adetailer.padding);
export const selectADetailerMaskBlur = createADetailerSelector((adetailer) => adetailer.maskBlur);
export const selectADetailerMinConfidence = createADetailerSelector((adetailer) => adetailer.minConfidence);
export const selectADetailerSaveBeforeImage = createADetailerSelector((adetailer) => adetailer.saveBeforeImage);
