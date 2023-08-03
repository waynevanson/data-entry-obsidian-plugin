import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useCursor, useFile } from 'src/hooks';
import { Pagination } from './pagination';

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

const useMax = (fa: Array<unknown> | undefined) =>
	useMemo(() => (fa?.length != null ? fa.length - 1 : null), [fa?.length]);

// create new, back to modify
// state: one form is for the new, one form
export function Main(props: MainProps) {
	const file = useFile(props.app, props.fileName);
	const max = useMax(file.query.data?.contents);

	const cursor = useCursor(max);

	const [form, formSet] = useState<unknown>({});

	useEffect(() => {
		const form =
			cursor.value != null
				? file.query.data?.contents?.[cursor.value]
				: null;

		formSet(form ?? {});
	}, [file.query.data?.contents, cursor.value, formSet]);

	const [errors, errorsSet] = useState<Array<unknown>>([]);

	const handleSubmit = () => {
		const array = file.query.data?.contents ?? [];
		if (cursor.value === null) {
			array.push(form);
		} else {
			array[cursor.value] = form;
		}
		file.mutation.mutateAsync(array);
	};

	return (
		<ErrorBoundary>
			<button onClick={cursor.clear} disabled={cursor.value == null}>
				New
			</button>
			<Pagination
				max={max ?? 0}
				onChange={cursor.valueSet}
				value={cursor.value}
			/>
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
							form,
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
