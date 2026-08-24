import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'pt' | 'en';

interface I18nState {
  language: Language;
  toggleLanguage: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'pt',
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === 'pt' ? 'en' : 'pt',
        })),
    }),
    {
      name: 'i18n-storage',
    }
  )
);
