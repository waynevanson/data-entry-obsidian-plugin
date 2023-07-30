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
}

export function Main(props: MainProps) {
	const [data, dataSet] = useState({});
	return (
		<>
			<div>Hello, Obsidian!</div>
			<ErrorBoundary>
				<JsonForms
					data={data}
					cells={materialCells}
					schema={props.schema ?? undefined}
					uischema={props.uischema ?? undefined}
					renderers={materialRenderers}
					onChange={({ data, errors: _errors }) => dataSet(data)}
				/>
			</ErrorBoundary>
		</>
	);
}

class ErrorBoundary extends React.Component<
	{ children?: ReactNode },
	{ hasError: boolean }
> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: any) {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return <h1>Something went wrong.</h1>;
		}
		return this.props.children;
	}
}
