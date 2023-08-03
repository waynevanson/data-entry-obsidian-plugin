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

export function useForm({
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
				? createdSet(form)
				: formsSet((forms) => ({
						...forms,
						[(cursor as number).toString()]: form,
				  })),
		[cursor],
	);

	return [form, formSet] as const;
}

export function useForms<A>(contents: Array<A> | null | undefined) {
	const [forms, formsSet] = useState<Record<string, A>>({});

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
