export type EmptyRecord = Record<string, never>;

export type EventCase<T extends string, A = EmptyRecord> = Readonly<
	{ type: T } & A
>;

export type StateCase<T extends string, A = undefined> = {
	readonly value: T;
	readonly context: A;
};

export type State<S extends Record<string, unknown>> = {
	[P in keyof S]: P extends string ? StateCase<P, S[P]> : never;
}[keyof S];

export type Event<S extends Record<string, Record<string, unknown>>> = {
	[P in keyof S]: P extends string ? EventCase<P, S[P]> : never;
}[keyof S];

export type ContextFromState<S extends State<Record<string, unknown>>> =
	S['context'];
