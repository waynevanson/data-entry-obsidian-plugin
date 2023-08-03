import { readonlyArray, readonlyRecord } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

type UsedState<A> = [A, Dispatch<SetStateAction<A>>];

export type Form = Record<string, unknown>;
export type Forms = Record<string, Form>;

export function useForm({
	cursor,
	created: [created, createdSet],
	forms: [forms, formsSet],
}: {
	cursor: number | null;
	created: UsedState<Form>;
	forms: UsedState<Forms>;
}) {
	const form = useMemo(
		() => (cursor == null ? created : forms[cursor]),
		[cursor, forms],
	);

	const formSet = useCallback(
		(form: Form) =>
			cursor == null
				? createdSet(form)
				: formsSet((forms) => ({
						...forms,
						[(cursor as number).toString()]: form,
				  })),
		[cursor],
	);

	return [form, formSet] as const;
}

export function useForms(contents: Array<Form> | null | undefined) {
	const [forms, formsSet] = useState<Forms>({});

	// reset forms cache when the file contents updates
	useEffect(() => {
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
	}, [contents]);

	return [forms, formsSet] as const;
}
