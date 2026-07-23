import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from 'app/store/store';
import type { SliceConfig } from 'app/store/types';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { isPlainObject } from 'es-toolkit';
import { assert } from 'tsafe';

export const zCharacter = z.object({
  id: z.string(),
  // General
  name: z.string(),
  gender: z.string(),
  age: z.string(),
  ethnicity: z.string(),
  skinTone: z.string().optional(),
  
  // Hair
  hairColor: z.string(),
  hairStyle: z.string(),
  hairLength: z.string().optional(),
  hairTexture: z.string().optional(),
  
  // Face
  foundation: z.string().optional(),
  blush: z.string().optional(),
  eyeColor: z.string(),
  eyeMakeup: z.string().optional(),
  eyeLashes: z.string().optional(),
  eyeBrows: z.string().optional(),
  lipMakeup: z.string().optional(),
  lipSize: z.string().optional(),
  freckles: z.string().optional(),
  expression: z.string().optional(),
  
  // Outfit & Accessories (formerly Body)
  bodyShape: z.string().optional(),
  bodyType: z.string(),
  glasses: z.string().optional(),
  headwear: z.string().optional(),
  topwear: z.string().optional(),
  middlewear: z.string().optional(),
  bottomwear: z.string().optional(),
  footwear: z.string().optional(),
  fullBodywear: z.string().optional(),
  accessories: z.string().optional(),
  jewelry: z.string().optional(),
  piercings: z.string().optional(),
  pose: z.string().optional(),

  referenceImageName: z.string().optional(),
  isReferenceEnabled: z.boolean().default(true),
});

export type Character = z.infer<typeof zCharacter>;

export const zCharacterPromptState = z.object({
  _version: z.literal(1),
  characters: z.array(zCharacter),
  savedCharacters: z.array(zCharacter).default([]),
});

export type CharacterPromptState = z.infer<typeof zCharacterPromptState>;

export const getInitialCharacterPromptState = (): CharacterPromptState => ({
  _version: 1,
  characters: [],
  savedCharacters: [],
});

const slice = createSlice({
  name: 'characterPrompt',
  initialState: getInitialCharacterPromptState(),
  reducers: {
    characterAdded: (state) => {
      state.characters.push({
        id: uuidv4(),
        name: '',
        gender: '',
        age: '',
        ethnicity: '',
        skinTone: '',
        hairColor: '',
        hairStyle: '',
        hairLength: '',
        hairTexture: '',
        foundation: '',
        blush: '',
        eyeColor: '',
        eyeMakeup: '',
        eyeLashes: '',
        eyeBrows: '',
        lipMakeup: '',
        lipSize: '',
        freckles: '',
        expression: '',
        bodyShape: '',
        bodyType: '',
        glasses: '',
        headwear: '',
        topwear: '',
        middlewear: '',
        bottomwear: '',
        footwear: '',
        fullBodywear: '',
        accessories: '',
        jewelry: '',
        piercings: '',
        pose: '',
        isReferenceEnabled: true,
      });
    },
    characterRemoved: (state, action: PayloadAction<string>) => {
      state.characters = state.characters.filter((c) => c.id !== action.payload);
    },
    characterUpdated: (state, action: PayloadAction<{ id: string; changes: Partial<Character> }>) => {
      const charIndex = state.characters.findIndex((c) => c.id === action.payload.id);
      if (charIndex !== -1) {
        const char = state.characters[charIndex];
        if (char) {
          Object.assign(char as Character, action.payload.changes);
        }
      }
    },
    characterSaved: (state, action: PayloadAction<Character>) => {
      // Create a fresh ID for the saved character so it doesn't conflict
      state.savedCharacters.push({ ...action.payload, id: uuidv4() });
    },
    savedCharacterDeleted: (state, action: PayloadAction<string>) => {
      state.savedCharacters = state.savedCharacters.filter((c) => c.id !== action.payload);
    },
    savedCharacterLoaded: (state, action: PayloadAction<Character>) => {
      // Load a saved character into the active list with a new ID
      state.characters.push({ ...action.payload, id: uuidv4() });
    },
  },
});

export const { characterAdded, characterRemoved, characterUpdated, characterSaved, savedCharacterDeleted, savedCharacterLoaded } = slice.actions;

export const selectCharacterPromptSlice = (state: RootState) => state.characterPrompt;

export const characterPromptSliceConfig: SliceConfig<typeof slice> = {
  slice,
  schema: zCharacterPromptState,
  getInitialState: getInitialCharacterPromptState,
  persistConfig: {
    migrate: (state) => {
      assert(isPlainObject(state));
      if (!('_version' in state)) {
        state._version = 1;
      }
      if (!('savedCharacters' in state)) {
        state.savedCharacters = [];
      }
      return zCharacterPromptState.parse(state);
    },
  },
};

export const buildCharacterPrompt = (char: Character): string => {
  const charDesc: string[] = [];
  
  // Physical
  const physical = [
    char.skinTone && char.skinTone !== 'Any' ? `${char.skinTone} skin` : '',
    char.age && char.age !== 'Any' ? char.age : '',
    char.ethnicity && char.ethnicity !== 'Any' ? char.ethnicity : '',
    char.bodyShape && char.bodyShape !== 'Any' ? char.bodyShape : '',
    char.bodyType && char.bodyType !== 'Any' ? `${char.bodyType} build` : '',
    char.gender && char.gender !== 'Any' ? char.gender : ''
  ].filter(Boolean).join(' ');
  
  if (physical) charDesc.push(physical);
  
  // Hair
  const hairParts = [
    char.hairLength && char.hairLength !== 'Any' ? char.hairLength : '',
    char.hairTexture && char.hairTexture !== 'Any' ? char.hairTexture : '',
    char.hairColor && char.hairColor !== 'Any' ? char.hairColor : '',
    char.hairStyle && char.hairStyle !== 'Any' ? char.hairStyle : '',
  ].filter(Boolean);
  
  if (hairParts.length > 0) {
    charDesc.push(`${hairParts.join(' ')} hair`);
  }
  
  // Face/Makeup
  if (char.foundation && char.foundation !== 'Any' && char.foundation !== 'None') charDesc.push(`${char.foundation} foundation`);
  if (char.blush && char.blush !== 'Any' && char.blush !== 'None') charDesc.push(`${char.blush} blush`);
  if (char.freckles && char.freckles !== 'Any' && char.freckles !== 'None') charDesc.push(`${char.freckles} freckles`);
  if (char.eyeColor && char.eyeColor !== 'Any') charDesc.push(`${char.eyeColor} eyes`);
  if (char.eyeMakeup && char.eyeMakeup !== 'Any' && char.eyeMakeup !== 'None') charDesc.push(`${char.eyeMakeup}`);
  if (char.eyeLashes && char.eyeLashes !== 'Any' && char.eyeLashes !== 'Natural') charDesc.push(`${char.eyeLashes} eyelashes`);
  if (char.eyeBrows && char.eyeBrows !== 'Any' && char.eyeBrows !== 'Natural') charDesc.push(`${char.eyeBrows} eyebrows`);
  if (char.lipMakeup && char.lipMakeup !== 'Any' && char.lipMakeup !== 'None') charDesc.push(`${char.lipMakeup}`);
  if (char.lipSize && char.lipSize !== 'Any' && char.lipSize !== 'Average') charDesc.push(`${char.lipSize} lips`);
  if (char.expression && char.expression !== 'Any') charDesc.push(`${char.expression} expression`);

  // Clothing
  const outfit: string[] = [];
  if (char.fullBodywear && char.fullBodywear !== 'Any' && char.fullBodywear !== 'None') {
    outfit.push(char.fullBodywear);
  } else {
    if (char.topwear && char.topwear !== 'Any' && char.topwear !== 'None') outfit.push(char.topwear);
    if (char.middlewear && char.middlewear !== 'Any' && char.middlewear !== 'None') outfit.push(`over ${char.middlewear}`);
    if (char.bottomwear && char.bottomwear !== 'Any' && char.bottomwear !== 'None') outfit.push(`with ${char.bottomwear}`);
  }
  if (char.footwear && char.footwear !== 'Any' && char.footwear !== 'None') outfit.push(`and ${char.footwear}`);
  
  if (outfit.length > 0) {
    charDesc.push(`wearing ${outfit.join(' ')}`);
  }

  // Accessories
  if (char.headwear && char.headwear !== 'Any' && char.headwear !== 'None') charDesc.push(`wearing ${char.headwear}`);
  if (char.glasses && char.glasses !== 'Any' && char.glasses !== 'None') charDesc.push(`wearing ${char.glasses}`);
  if (char.accessories) charDesc.push(char.accessories);
  if (char.jewelry) charDesc.push(char.jewelry);
  if (char.piercings) charDesc.push(`${char.piercings} piercing`);
  
  // Pose
  if (char.pose && char.pose !== 'Any') charDesc.push(`pose: ${char.pose}`);

  const desc = charDesc.filter(Boolean).join(', ');
  return char.name ? `[${char.name}: ${desc}]` : `[${desc}]`;
};
