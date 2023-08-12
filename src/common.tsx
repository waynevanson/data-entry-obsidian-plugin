import { JsonSchema, UISchemaElement } from '@jsonforms/core';

export type Datasource = Sum<{
  file: string;
  folder: string;
}>;

export interface Configuration {
  datasource: Datasource;
  forms: {
    schema: JsonSchema;
    uischema?: UISchemaElement;
  };
  submit?: string;
}

export type Sum<T extends Record<string, unknown>> = keyof T extends never
  ? never
  : {
      [P in keyof T]: Record<P, T[P]>;
    }[keyof T];
