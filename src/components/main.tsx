import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import { ReactNode, useMemo, useState } from 'react';
import { useCursor, useFile } from 'src/hooks';

export interface MainProps {
	app: App;
	schema: JsonSchema;
	uischema?: UISchemaElement;
	submit?: string;
	onSubmit?: (data: unknown) => void;
	fileName: string;
}

export interface UseQueryFileReturn {
	file: TFile;
	contents: Array<unknown>;
}

export function Main(props: MainProps) {
	const file = useFile(props.app, props.fileName);

	const cursor = useCursor(file.query.data?.contents?.length);

	// use this to populate a list of forms
	// reset cache when fetched.
	const selectedData = useMemo<unknown | null>(
		(): unknown | null =>
			cursor.value !== null
				? file.query.data?.contents?.[cursor.value]
				: null,
		[cursor],
	);

	// just like the file.contents but in a cached form?
	const [forms, formsSet] = useState(new Map());

	const [form, formSet] = useState<unknown>({});
	const [errors, errorsSet] = useState<Array<unknown>>([]);

	return (
		<ErrorBoundary>
			<button onChange={cursor.clear}>New</button>
			<button onChange={cursor.decrement}>Previous</button>
			<button onChange={cursor.increment}>Next</button>
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

const lastIndexOrNull = (
	values: Array<unknown> | undefined | null,
): number | null =>
	values != null ? (values.length > 0 ? values.length - 1 : null) : null;
