import { ThemeProvider as MaterialThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useTheme } from './material';

export interface ProviderProps {
  query: QueryClient;
  styledTheme: Parameters<typeof StyledThemeProvider>[0]['theme'];
  children: ReactNode;
}

export const Providers = (props: ProviderProps) => (
  <QueryClientProvider client={props.query}>
    <StyledThemeProvider theme={props.styledTheme}>
      <MaterialThemeProvider theme={useTheme()}>
        {props.children}
      </MaterialThemeProvider>
    </StyledThemeProvider>
  </QueryClientProvider>
);
