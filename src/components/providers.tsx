import { ThemeProvider as MaterialThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { ReactNode, useState } from 'react';
import { useTheme } from './material';
import { Theme } from '@mui/system';

export interface ProviderProps {
  queryClient: QueryClient;
  materialTheme: Partial<Theme>;
  children: ReactNode;
}

export const Providers = (props: ProviderProps) => (
  <QueryClientProvider client={props.queryClient}>
    <MaterialThemeProvider theme={props.materialTheme}>
      {props.children}
    </MaterialThemeProvider>
  </QueryClientProvider>
);

export const MainProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const [client] = useState(() => new QueryClient());
  return (
    <Providers materialTheme={theme} queryClient={client}>
      {children}
    </Providers>
  );
};
