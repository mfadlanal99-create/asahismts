import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ThemeContext,
  type PixelSeed,
  type Theme,
  type UiStyle,
} from './ThemeContext';

const STORAGE_KEY = 'mechlab-theme';
const SEED_STORAGE_KEY = 'mechlab-pixel-seed';
const UI_STYLE_STORAGE_KEY = 'mechlab-ui-style';

const VALID_SEEDS: PixelSeed[] = ['sapphire', 'mint', 'lavender', 'amber'];

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

function getInitialSeed(): PixelSeed {
  if (typeof window === 'undefined') return 'sapphire';
  try {
    const stored = window.localStorage.getItem(SEED_STORAGE_KEY);
    if (stored && VALID_SEEDS.includes(stored as PixelSeed)) {
      return stored as PixelSeed;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'sapphire';
}

function getInitialUiStyle(): UiStyle {
  if (typeof window === 'undefined') return 'databank';
  try {
    const stored = window.localStorage.getItem(UI_STYLE_STORAGE_KEY);
    if (stored === 'databank' || stored === 'pixel') return stored;
  } catch {
    // Ignore storage access errors
  }
  return 'databank';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [seed, setSeedState] = useState<PixelSeed>(getInitialSeed);
  const [uiStyle, setUiStyleState] = useState<UiStyle>(getInitialUiStyle);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage access errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.pixelSeed = seed;
    try {
      window.localStorage.setItem(SEED_STORAGE_KEY, seed);
    } catch {
      // Ignore storage access errors
    }
  }, [seed]);

  useEffect(() => {
    document.documentElement.dataset.uiStyle = uiStyle;
    try {
      window.localStorage.setItem(UI_STYLE_STORAGE_KEY, uiStyle);
    } catch {
      // Ignore storage access errors
    }
  }, [uiStyle]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setSeed = useCallback((next: PixelSeed) => {
    setSeedState(next);
  }, []);

  const setUiStyle = useCallback((next: UiStyle) => {
    setUiStyleState(next);
  }, []);

  const toggleUiStyle = useCallback(() => {
    setUiStyleState((prev) => (prev === 'databank' ? 'pixel' : 'databank'));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        seed,
        setSeed,
        uiStyle,
        setUiStyle,
        toggleUiStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
