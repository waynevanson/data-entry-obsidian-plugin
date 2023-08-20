import { Theme, ThemeOptions, createTheme, css } from '@mui/material';
import deepmerge from 'deepmerge';
import { useEffect, useState } from 'react';

const color = (variable: string) =>
  getComputedStyle(document.body).getPropertyValue(variable).trim();

const createObsidianThemeOptions = (): ThemeOptions => ({
  spacing: 4,
  palette: {
    warning: {
      main: color('--color-orange'),
    },
    success: {
      main: color('--color-green'),
    },
    info: {
      main: color('--color-blue'),
    },
    error: {
      main: color('--color-red'),
    },
    divider: color('--divider-color'),
    primary: {
      main: color('--interactive-accent'),
    },
  },
});

export const useColorScheme = () => {
  const modeUsed = useState<'light' | 'dark'>('dark');
  const [, modeSet] = modeUsed;

  useEffect(() => {
    const listener = (query: MediaQueryListEvent) => {
      const value = query.matches ? 'dark' : 'light';
      modeSet(value);
    };

    const target = window.matchMedia('(prefers-color-scheme: dark)');

    target.addEventListener('change', listener);
    return () => target.removeEventListener('change', listener);
  }, [modeSet]);

  return modeUsed;
};

export const useTheme = () => {
  const [theme, themeSet] = useState<Theme>(createTheme({}));
  const [mode] = useColorScheme();

  useEffect(() => {
    const obsidianThemeOptions = createObsidianThemeOptions();
    const overrides: ThemeOptions = { palette: { mode } };
    const themeOptions = deepmerge(obsidianThemeOptions, overrides);
    const theme = createTheme(themeOptions);
    themeSet(theme);
  }, [mode, themeSet]);

  return theme;
};
