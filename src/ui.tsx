import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { App } from 'obsidian';
import * as React from 'react';
import { ReactNode, useState } from 'react';

export interface MainProps {
	initialState?: unknown;
	app: App;
	schema: JsonSchema;
	uischema?: UISchemaElement;
	submit?: string;
	onSubmit?: (data: unknown) => void;
}

export function Main(props: MainProps) {
	const [form, formSet] = useState<unknown>(props.initialState ?? {});
	const [errors, errorsSet] = useState<Array<unknown>>([]);

	return (
		<ErrorBoundary>
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
