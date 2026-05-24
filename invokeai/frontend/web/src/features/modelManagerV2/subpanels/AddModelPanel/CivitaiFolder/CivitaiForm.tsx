import { Button, Flex, FormControl, FormHelperText, FormLabel, Input } from '@invoke-ai/ui-library';
import { useInstallModel } from 'features/modelManagerV2/hooks/useInstallModel';
import type { ChangeEventHandler } from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const CivitaiForm = memo(() => {
  const [civitaiUrl, setCivitaiUrl] = useState('');
  const [civitaiToken, setCivitaiToken] = useState('');
  const { t } = useTranslation();

  const [installModel, { isLoading }] = useInstallModel();

  useEffect(() => {
    const savedToken = localStorage.getItem('civitaiToken');
    if (savedToken) {
      setCivitaiToken(savedToken);
    }
  }, []);

  const handleSetCivitaiUrl: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setCivitaiUrl(e.target.value);
  }, []);

  const handleSetCivitaiToken: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const val = e.target.value;
    setCivitaiToken(val);
    localStorage.setItem('civitaiToken', val);
  }, []);

  const getModels = useCallback(() => {
    if (!civitaiUrl) {
      return;
    }
    
    let url = civitaiUrl;
    if (civitaiToken && civitaiToken.trim().length > 0) {
      const separator = url.includes('?') ? '&' : '?';
      // If the user already pasted a token in the URL, don't append another one
      if (!url.includes('token=')) {
        url = `${url}${separator}token=${civitaiToken}`;
      }
    }

    installModel({
      source: url,
      onSuccess: () => {
        setCivitaiUrl('');
      }
    });
  }, [civitaiUrl, civitaiToken, installModel]);

  return (
    <Flex flexDir="column" height="100%" gap={6}>
      <FormControl w="full" orientation="vertical" flexShrink={0}>
        <FormLabel>CivitAI Model URL</FormLabel>
        <Flex gap={3} alignItems="center" w="full">
          <Input
            placeholder="https://civitai.com/models/..."
            value={civitaiUrl}
            onChange={handleSetCivitaiUrl}
          />
          <Button
            onClick={getModels}
            isLoading={isLoading}
            isDisabled={civitaiUrl.length === 0}
            size="sm"
            flexShrink={0}
          >
            {t('modelManager.install')}
          </Button>
        </Flex>
        <FormHelperText>Paste the URL of a CivitAI model page or download link.</FormHelperText>
      </FormControl>

      <FormControl w="full" orientation="vertical" flexShrink={0}>
        <FormLabel>CivitAI API Token (Required for some models)</FormLabel>
        <Input
          type="password"
          placeholder="Paste your CivitAI API Token here"
          value={civitaiToken}
          onChange={handleSetCivitaiToken}
        />
        <FormHelperText>Your token is saved securely in your browser and automatically attached to downloads.</FormHelperText>
      </FormControl>
    </Flex>
  );
});

CivitaiForm.displayName = 'CivitaiForm';
