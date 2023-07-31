import { JsonSchema, UISchemaElement } from '@jsonforms/core';

export interface Configuration {
	datasource: Sum<{
		templater: { template: string } & never;
		file: string & never;
		directory: string & never;
		dataview: never;
		command: CommandSource;
	}>;
	forms: {
		schema: JsonSchema;
		uischema?: UISchemaElement;
	};
	submit?: string;
}

export type CommandSource = Record<
	'get' | 'set',
	Sum<Record<'name' | 'id', string>>
>;

export type Sum<T extends Record<string, unknown>> = keyof T extends never
	? never
	: {
			[P in keyof T]: Record<P, T[P]>;
	  }[keyof T];
