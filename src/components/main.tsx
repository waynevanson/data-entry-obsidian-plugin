import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import {
	Dispatch,
	ReactNode,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useCursor, useFile } from 'src/hooks';
import { Pagination } from './pagination';
import { Endomorphism } from 'fp-ts/lib/Endomorphism';
import { readonlyArray, readonlyRecord } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

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

function useInvariant<A, B>(
	usedState: [value: A, setValue: Dispatch<SetStateAction<A>>],
	covariant: (a: A) => B,
	contravariant: (b: B) => A,
) {
	const [state, stateSet] = usedState;

	const next = useMemo(() => covariant(state), [state, covariant]);
	const nextSet = useCallback(
		(fa: SetStateAction<B>) =>
			typeof fa === 'function'
				? stateSet((a) =>
						contravariant((fa as Endomorphism<B>)(covariant(a))),
				  )
				: stateSet(contravariant(fa)),
		[covariant, contravariant, stateSet],
	);

	return [next, nextSet] as const;
}

type UsedState<A> = [A, Dispatch<SetStateAction<A>>];

function useForm({
	cursor,
	created: [created, createdSet],
	forms: [forms, formsSet],
}: {
	cursor: number | null;
	created: UsedState<unknown>;
	forms: UsedState<Record<string, unknown>>;
}) {
	const form = useMemo(
		() => (cursor == null ? created : forms[cursor]),
		[cursor, forms],
	);
	const formSet = useCallback(
		(form: unknown) =>
			cursor == null
				? createdSet(value)
				: formsSet((forms) => ({
						...forms,
						[(cursor as number).toString()]: form,
				  })),
		[cursor],
	);

	return [form, formSet] as const;
}

// create new, back to modify
// state: one form is for the new, one form
export function Main(props: MainProps) {
	const file = useFile(props.app, props.fileName);
	const max = useMax(file.query.data?.contents);

	const cursor = useCursor(max);

	const [created, createdSet] = useState<unknown>({});
	const [forms, formsSet] = useState<Record<string, unknown>>({});
	const [form, formSet] = useForm({
		cursor: cursor.value,
		created: [created, createdSet],
		forms: [forms, formsSet],
	});

	// reset forms cache when the file contents updates
	useEffect(() => {
		const contents = file.query.data?.contents;
		if (contents == null) return;

		const form = pipe(
			contents,
			readonlyArray.fromArray,
			readonlyArray.mapWithIndex(
				(index, form) => [index.toString(), form] as const,
			),
			readonlyRecord.fromEntries,
		);

		formsSet(form);
	}, [file.query.data?.contents]);

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
			<button onClick={cursor.clear} disabled={cursor.value == null}>
				{cursor.value != null ? 'Create' : 'Continue'}
			</button>
			{/* if null, set cursor to 1 beyond last to show we create new item */}
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
