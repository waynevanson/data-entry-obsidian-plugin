import {
	JsonSchema,
	UISchemaElement,
	createDefaultValue,
} from '@jsonforms/core';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import { ReactNode, useState } from 'react';
import { Form, useCursor, useFile, useForm, useForms } from 'src/hooks';
import { ControlPanel } from './control-panel';
import { Formed } from './form';
import { Alert } from '@mui/material';
import { useToggle } from 'src/hooks/toggle';
import { readonlyRecord } from 'fp-ts';

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
	const [newMode, newModeToggle] = useToggle(true);
	const [defaultForm] = useState(
		() => createDefaultValue(props.schema) as Form,
	);
	const [created, createdSet] = useState<Form>(defaultForm);
	const [forms, formsSet] = useForms(file.query.data?.contents as never);
	const max =
		file.query.data?.contents != null ? readonlyRecord.size(forms) : null;

	// currently an index of positive numbers
	const cursor = useCursor(0, max);
	const [form, formSet] = useForm({
		newMode,
		cursor: cursor.value,
		created: [created, createdSet],
		forms: [forms, formsSet],
	});

	const [errors, errorsSet] = useState<Array<unknown>>([]);

	const handleSubmit = () => {
		const array = file.query.data?.contents ?? [];
		if (newMode) {
			array.push(form);
		} else if (cursor.value !== null) {
			array[cursor.value] = form;
		}
		file.mutation.mutate(array);
	};

	const count = max != null ? max : 0;
	const page = cursor.value != null ? cursor.value + 1 : 0;
	return (
		<ErrorBoundary>
			<ControlPanel
				newMode={newMode}
				onClear={() => formSet(defaultForm)}
				onToggleMode={newModeToggle}
				count={count}
				page={page}
				onPageChange={(_, page) => cursor.valueSet(page - 1)}
			/>
			{form != null ? (
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
				<Alert severity="info">There are no items to display.</Alert>
			)}
			<pre>
				<code>
					{JSON.stringify(
						{
							newMode,
							pagination: { count, page: page ?? null },
							cursed: {
								max,
								cursor: cursor.value,
							},
							form,
							created,
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
