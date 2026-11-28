import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';
export type PixelSeed = 'sapphire' | 'mint' | 'lavender' | 'amber';
export type UiStyle = 'databank' | 'pixel';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  seed: PixelSeed;
  setSeed: (seed: PixelSeed) => void;
  uiStyle: UiStyle;
  setUiStyle: (style: UiStyle) => void;
  toggleUiStyle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
