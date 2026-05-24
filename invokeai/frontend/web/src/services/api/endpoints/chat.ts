import type { components } from 'services/api/schema';

import { api, buildV1Url } from '..';

export type ChatRequest = components['schemas']['ChatRequest'];
export type ChatMessage = components['schemas']['ChatMessage'];

export const buildChatUrl = (path: string = '') => buildV1Url(`chat/${path}`);

export const chatApi = api.injectEndpoints({
  endpoints: (build) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listChatModels: build.query<any, void>({
      query: () => ({
        url: buildChatUrl('models'),
        method: 'GET',
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatGenerate: build.mutation<any, ChatRequest>({
      query: (body) => ({
        url: buildChatUrl('generate'),
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useListChatModelsQuery, useChatGenerateMutation } = chatApi;
