import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LanguageContext, type Language } from './LanguageContext';

const STORAGE_KEY = 'asahi-smts-language';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'id' || stored === 'ja') {
      return stored;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage access errors
    }
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const pick = useCallback(
    <T,>(en: T, id: T, ja: T): T => {
      if (language === 'id') return id;
      if (language === 'ja') return ja;
      return en;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, pick }}>
      {children}
    </LanguageContext.Provider>
  );
}
