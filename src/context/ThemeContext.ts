import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';
export type PixelSeed = 'sapphire' | 'mint' | 'lavender' | 'amber';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  seed: PixelSeed;
  setSeed: (seed: PixelSeed) => void;
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
