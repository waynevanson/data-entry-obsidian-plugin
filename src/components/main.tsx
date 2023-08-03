import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { Form, useCursor, useFile, useForm } from 'src/hooks';
import { Pagination } from './pagination';
import { useForms } from 'src/hooks';
import { createDefaultValue } from '@jsonforms/core';
import { dequal } from 'dequal';
import { styled } from 'styled-components';

export interface MainProps {
	app: App;
	schema: JsonSchema;
	uischema?: UISchemaElement;
	submit?: string;
	fileName: string;
}

export interface UseQueryFileReturn {
	file: TFile;
	contents: Array<unknown>;
}

const useMax = (array: Array<unknown> | undefined) =>
	useMemo(
		() => (array?.length != null ? array.length - 1 : null),
		[array?.length],
	);

const ButtonPanel = styled.div`
	display: flex;
	gap: 1rem;
`;

const ControlPanel = styled.div`
	display: flex;
	justify-content: space-between;
`;

// create new, back to modify
// state: one form is for the new, one form
export function Main(props: MainProps) {
	const file = useFile(props.app, props.fileName);
	const max = useMax(file.query.data?.contents);
	const cursor = useCursor(max);
	const [defaultForm] = useState(
		() => createDefaultValue(props.schema) as Form,
	);
	const [created, createdSet] = useState<Form>(defaultForm);
	const [forms, formsSet] = useForms(file.query.data?.contents as never);
	const [form, formSet] = useForm({
		cursor: cursor.value,
		created: [created, createdSet],
		forms: [forms, formsSet],
	});

	const [errors, errorsSet] = useState<Array<unknown>>([]);

	const handleSubmit = () => {
		const array = file.query.data?.contents ?? [];
		if (cursor.value === null) {
			array.push(form);
		} else {
			array[cursor.value] = form;
		}
		file.mutation.mutate(array);
	};

	return (
		<ErrorBoundary>
			<ControlPanel>
				<ButtonPanel>
					<button
						onClick={() => {
							cursor.value != null
								? cursor.store()
								: cursor.fetch();
						}}
					>
						{cursor.value != null ? 'Create' : 'Back to item'}
					</button>
					<button onClick={() => formSet(defaultForm)}>Clear</button>
				</ButtonPanel>
				{/* if null, set cursor to 1 beyond last to show we create new item */}
				<Pagination
					max={max ?? 0}
					onChange={cursor.valueSet}
					value={cursor.value}
				/>
			</ControlPanel>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					handleSubmit();
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
			<pre>
				<code>
					{JSON.stringify(
						{
							max,
							cursor: cursor.value,
							defaultForm,
							created,
							form,
							forms,
							contents: file.query.data?.contents,
						},
						null,
						2,
					)}
				</code>
			</pre>
		</ErrorBoundary>
	);
}

class ErrorBoundary extends React.Component<
	{ children?: ReactNode },
	{ hasError: false } | { hasError: true; error: unknown }
> {
	constructor(props: { children?: ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: unknown) {
		return { hasError: true, error: error };
	}

	render() {
		if (!this.state.hasError) return this.props.children;
		return (
			<div>
				<h1>Something went wrong.</h1>
				<p>
					Please see the error that was thrown below for more
					information.
				</p>
				<pre>
					<code>{String(this.state.error)}</code>
				</pre>
			</div>
		);
	}
}
