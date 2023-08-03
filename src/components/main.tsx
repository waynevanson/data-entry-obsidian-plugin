import {
	JsonSchema,
	UISchemaElement,
	createDefaultValue,
} from '@jsonforms/core';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import { ReactNode, useState } from 'react';
import { Form, useCursor, useFile, useForm, useForms, useMax } from 'src/hooks';
import { ControlPanel } from './control-panel';
import { Formed } from './form';

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

export function Main(props: MainProps) {
	const file = useFile(props.app, props.fileName);
	const max = useMax(file.query.data?.contents) ?? 0;
	const [newMode, newModeSet] = useState(true);
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
			<ControlPanel
				newMode={newMode}
				onClear={() => formSet(defaultForm)}
				onToggleMode={(newMode) => {
					newModeSet(newMode);
					newMode ? cursor.store() : cursor.fetch();
				}}
				count={max}
				page={cursor.value ?? undefined}
			/>
			{cursor.value != null ? (
				<Formed
					errors={errors as never}
					onSubmit={handleSubmit}
					submitLabel={props.submit}
					schema={props.schema ?? undefined}
					uischema={props.uischema ?? undefined}
					data={form}
					onChange={({ data, errors: _errors }) => {
						formSet(data);
						errorsSet(errors);
					}}
				/>
			) : (
				'There are no items to display from the datasource. Please create new.'
			)}
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
