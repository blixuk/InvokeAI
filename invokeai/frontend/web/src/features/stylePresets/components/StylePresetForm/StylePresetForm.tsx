import { Box, Button, Flex, FormControl, FormLabel, Input, Spacer, Switch, Text } from '@invoke-ai/ui-library';
import { PRESET_PLACEHOLDER } from 'features/stylePresets/hooks/usePresetModifiedPrompts';
import { $stylePresetModalState } from 'features/stylePresets/store/stylePresetModal';
import { toast } from 'features/toast/toast';
import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import type { PresetType } from 'services/api/endpoints/stylePresets';
import { useCreateStylePresetMutation, useUpdateStylePresetMutation } from 'services/api/endpoints/stylePresets';

import { StylePresetImageField } from './StylePresetImageField';
import { StylePresetPromptField } from './StylePresetPromptField';

export type StylePresetFormData = {
  name: string;
  positivePrompt: string;
  negativePrompt: string;
  image: File | null;
  type: PresetType;
  imageAsStyleReference: boolean;
};

export const StylePresetForm = ({
  updatingStylePresetId,
  formData,
}: {
  updatingStylePresetId: string | null;
  formData: StylePresetFormData | null;
}) => {
  const [createStylePreset, { isLoading: isCreating }] = useCreateStylePresetMutation();
  const [updateStylePreset, { isLoading: isUpdating }] = useUpdateStylePresetMutation();
  const { t } = useTranslation();

  const { handleSubmit, control, register, formState } = useForm<StylePresetFormData>({
    defaultValues: formData || {
      name: '',
      positivePrompt: '',
      negativePrompt: '',
      image: null,
      type: 'user',
      imageAsStyleReference: formData?.imageAsStyleReference ?? false,
    },
    mode: 'onChange',
  });

  const handleClickSave = useCallback<SubmitHandler<StylePresetFormData>>(
    async (data) => {
      const payload = {
        data: {
          name: data.name,
          positive_prompt: data.positivePrompt,
          negative_prompt: data.negativePrompt,
          image_as_style_reference: data.imageAsStyleReference,
          type: data.type,
        },
        image: data.image,
      };

      try {
        if (updatingStylePresetId) {
          await updateStylePreset({
            id: updatingStylePresetId,
            ...payload,
          }).unwrap();
        } else {
          await createStylePreset(payload).unwrap();
        }
      } catch {
        toast({
          status: 'error',
          title: 'Failed to save style preset',
        });
      }

      $stylePresetModalState.set({
        prefilledFormData: null,
        updatingStylePresetId: null,
        isModalOpen: false,
      });
    },
    [updatingStylePresetId, updateStylePreset, createStylePreset]
  );

  const renderStyleRefSwitch = useCallback(
    ({ field }: { field: { value: boolean; onChange: (value: boolean) => void } }) => (
      <FormControl
        w="auto"
        gap={2}
        orientation="horizontal"
        title="Use this image automatically as a Style Reference when the template is applied."
      >
        <FormLabel m={0} fontSize="sm" cursor="pointer" whiteSpace="nowrap">
          Style Ref
        </FormLabel>
        <Switch size="sm" isChecked={field.value} onChange={field.onChange} />
      </FormControl>
    ),
    []
  );

  return (
    <Flex flexDir="column" gap={4}>
      <Flex alignItems="flex-start" gap={4}>
        <Flex flexDir="column" gap={2} alignItems="center">
          <StylePresetImageField control={control} name="image" />
          <Controller
            control={control}
            name="imageAsStyleReference"
            render={renderStyleRefSwitch}
          />
        </Flex>
        <FormControl orientation="vertical">
          <FormLabel>{t('stylePresets.name')}</FormLabel>
          <Input size="md" {...register('name', { required: true, minLength: 1 })} />
        </FormControl>
      </Flex>

      <StylePresetPromptField label={t('stylePresets.positivePrompt')} control={control} name="positivePrompt" />
      <StylePresetPromptField label={t('stylePresets.negativePrompt')} control={control} name="negativePrompt" />
      <Box>
        <Text variant="subtext">{t('stylePresets.promptTemplatesDesc1')}</Text>
        <Text variant="subtext">
          <Trans
            i18nKey="stylePresets.promptTemplatesDesc2"
            components={{ Pre: <Pre /> }}
            values={{ placeholder: PRESET_PLACEHOLDER }}
          />
        </Text>
        <Text variant="subtext">{t('stylePresets.promptTemplatesDesc3')}</Text>
      </Box>

      <Flex justifyContent="space-between" alignItems="flex-end" gap={10}>
        <Spacer />
        <Button
          onClick={handleSubmit(handleClickSave)}
          isDisabled={!formState.isValid}
          isLoading={isCreating || isUpdating}
        >
          {t('common.save')}
        </Button>
      </Flex>
    </Flex>
  );
};

const Pre = (props: PropsWithChildren) => (
  <Text as="span" fontFamily="monospace" fontWeight="semibold">
    {props.children}
  </Text>
);
