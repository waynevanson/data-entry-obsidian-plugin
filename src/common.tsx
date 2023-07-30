import { JsonSchema, UISchemaElement } from '@jsonforms/core';

export interface Configuration {
	datasource: Sum<{
		templater: { template: string };
		file: string;
		directory: string;
	}>;
	forms: {
		schema: JsonSchema;
		uischema?: UISchemaElement;
	};
}

export type Sum<T extends Record<string, unknown>> = keyof T extends never
	? never
	: {
			[P in keyof T]: Record<P, T[P]>;
	  }[keyof T];
