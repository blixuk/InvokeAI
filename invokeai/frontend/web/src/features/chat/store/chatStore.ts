import { atom } from 'nanostores';

export type Role = 'user' | 'assistant' | 'system';

export type ToolCall = {
  id?: string;
  type?: string;
  function: {
    name: string;
    arguments: string | Record<string, unknown>;
  };
};

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  images?: string[];
  tool_calls?: ToolCall[];
};

const getInitialModel = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('aiAssistantActiveModel') || null;
  }
  return null;
};

const getInitialMode = () => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('aiAssistantMode') as 'agentic' | 'click-to-apply') || 'click-to-apply';
  }
  return 'click-to-apply';
};

export const $chatHistory = atom<ChatMessage[]>([]);
export const $activeModel = atom<string | null>(getInitialModel());
export const $chatMode = atom<'agentic' | 'click-to-apply'>(getInitialMode());
export const $chatInput = atom<string>('');
export const $chatImages = atom<string[]>([]);

$activeModel.listen((val) => {
  if (typeof window !== 'undefined') {
    if (val) {
      localStorage.setItem('aiAssistantActiveModel', val);
    } else {
      localStorage.removeItem('aiAssistantActiveModel');
    }
  }
});

$chatMode.listen((val) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aiAssistantMode', val);
  }
});
