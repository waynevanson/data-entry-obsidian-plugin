import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

export interface ProviderProps {
	query: QueryClient;
	theme: Parameters<typeof ThemeProvider>[0]['theme'];
	children: ReactNode;
}

export const Providers = (props: ProviderProps) => (
	<QueryClientProvider client={props.query}>
		<ThemeProvider theme={props.theme}>{props.children}</ThemeProvider>
	</QueryClientProvider>
);
