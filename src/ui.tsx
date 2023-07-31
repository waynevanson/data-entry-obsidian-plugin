import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { App } from 'obsidian';
import * as React from 'react';
import { ReactNode, useState } from 'react';
import { Button } from './components';
import { ThemeProvider } from 'styled-components';
import {
	QueryClientProvider,
	QueryClient,
	useQuery,
} from '@tanstack/react-query';

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

export interface ApplicationProps {
	app: App;
	schema: JsonSchema;
	uischema?: UISchemaElement;
	submit?: string;
	onSubmit?: (data: unknown) => void;
	data: Array<unknown>;
}

export const Entry = (props: ApplicationProps) => {
	const [queryClient] = useState(new QueryClient());
	return (
		<Providers query={queryClient} theme={{}}>
			<Application {...props} />
		</Providers>
	);
};

// keep files in sync
export function useQueryFiles(app: App) {
	return useQuery({
		queryFn: async (context) => {
			app.vault.getFiles();
		},
	});
}

// selects a current thing until told otherwise.
export function Application(props: ApplicationProps) {
	const [selected, selectedSet] = useState<number | null>(
		props.data.length > 0 ? props.data.length - 1 : null,
	);
	const [form, formSet] = useState<unknown>(
		selected !== null ? props.data[selected] : {},
	);
	const [errors, errorsSet] = useState<Array<unknown>>([]);

	return (
		<ErrorBoundary>
			<Button
				onChange={() => selectedSet(null)}
				disabled={selected != null}
			>
				New
			</Button>

			<Button
				onChange={() =>
					selectedSet((selected) =>
						selected !== null ? selected - 1 : null,
					)
				}
				disabled={selected === null || selected <= 0}
			>
				Previous
			</Button>
			<Button
				onChange={() =>
					selectedSet((selected) =>
						selected !== null ? selected + 1 : null,
					)
				}
				disabled={selected === null || selected < props.data.length}
			>
				Next
			</Button>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					props.onSubmit?.(form);
				}}
			>
				<JsonForms
					data={form}
					cells={materialCells}
					schema={props.schema ?? undefined}
					uischema={props.uischema ?? undefined}
					renderers={materialRenderers}
					onChange={({ data, errors: _errors }) => {
						formSet(data);
						errorsSet(errors);
					}}
				/>
				<button type="submit" disabled={errors.length > 0}>
					{props.submit ?? 'Submit'}
				</button>
			</form>
		</ErrorBoundary>
	);
}

class ErrorBoundary extends React.Component<
	{ children?: ReactNode },
	{ hasError: boolean }
> {
	constructor(props: { children?: ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: unknown) {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return <h1>Something went wrong.</h1>;
		}
		return this.props.children;
	}
}
