import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  selectedModelId: string;
  theme: 'dark' | 'light';
  setSelectedModelId: (modelId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedModelId: 'meta/llama-3.1-70b-instruct',
      theme: 'dark',
      setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
      setTheme: (theme) => set({ theme })
    }),
    { name: 'nim-chat-preferences' }
  )
);
