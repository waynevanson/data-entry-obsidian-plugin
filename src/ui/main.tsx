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
	app: App;
	schema: JsonSchema;
	uischema?: UISchemaElement;
	submit?: string;
}

export function Main(props: MainProps) {
	const [data, dataSet] = useState({});
	return (
		<>
			<div>Hello, Obsidian!</div>
			<ErrorBoundary>
				<form
					onSubmit={(event) => {
						event.preventDefault();
					}}
				>
					<JsonForms
						data={data}
						cells={materialCells}
						schema={props.schema ?? undefined}
						uischema={props.uischema ?? undefined}
						renderers={materialRenderers}
						onChange={({ data, errors: _errors }) => dataSet(data)}
					/>
					<button type="submit">{props.submit ?? 'Submit'}</button>
				</form>
			</ErrorBoundary>
		</>
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
