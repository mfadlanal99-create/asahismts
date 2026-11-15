import { createContext, useContext } from 'react';

export type Language = 'en' | 'id' | 'ja';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  pick: <T>(en: T, id: T, ja: T) => T;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
