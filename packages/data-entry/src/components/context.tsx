import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Vault } from 'obsidian';
import { createContext, useContext } from 'react';

export interface MainProps {
  vault: Vault;
  schema: JsonSchema;
  uischema?: UISchemaElement;
  fileName: string;
}

const context = createContext<MainProps>(null as never);

export const { Provider: ApplicationProvider } = context;
export const useApplication = () => useContext(context);
