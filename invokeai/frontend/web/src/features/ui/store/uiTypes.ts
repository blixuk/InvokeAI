import { isPlainObject } from 'es-toolkit';
import { z } from 'zod';

const zTabName = z.enum(['generate', 'canvas', 'upscaling', 'workflows', 'models', 'customNodes', 'queue', 'chat', 'templates']);
export type TabName = z.infer<typeof zTabName>;

const zPartialDimensions = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
});

const zSerializable = z.any().refine(isPlainObject);
export type Serializable = z.infer<typeof zSerializable>;

export const zUIState = z.object({
  _version: z.literal(6),
  activeTab: zTabName,
  shouldShowItemDetails: z.boolean(),
  shouldShowProgressInViewer: z.boolean(),
  shouldUsePagedGalleryView: z.boolean(),
  accordions: z.record(z.string(), z.boolean()),
  expanders: z.record(z.string(), z.boolean()),
  textAreaSizes: z.record(z.string(), zPartialDimensions),
  panels: z.record(z.string(), zSerializable),
  shouldShowNotificationV2: z.boolean(),
  pickerCompactViewStates: z.record(z.string(), z.boolean()),
  activeOptionalModuleIds: z.array(z.string()),
});
export type UIState = z.infer<typeof zUIState>;
export const getInitialUIState = (): UIState => ({
  _version: 6 as const,
  activeTab: 'generate' as const,
  shouldShowItemDetails: false,
  shouldShowProgressInViewer: true,
  shouldUsePagedGalleryView: false,
  accordions: {},
  expanders: {},
  textAreaSizes: {},
  panels: {},
  shouldShowNotificationV2: true,
  pickerCompactViewStates: {},
  activeOptionalModuleIds: ['adetailer', 'sega', 'pid', 'refiner', 'advanced'],
});
