import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { App, TFile } from 'obsidian';
import * as React from 'react';
import { ReactNode, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import {
	QueryClientProvider,
	QueryClient,
	useQuery,
	useMutation,
} from '@tanstack/react-query';

export const useQueryFile = (app: App, fileName: string) =>
	useQuery({
		queryFn: async () => {
			const files = app.vault.getFiles();
			const file = files.find((file) => file.path === fileName);

			if (file == null) {
				throw new Error(
					`Could not find the file with name "${fileName}"`,
				);
			}

			const contents: Array<unknown> = JSON.parse(
				await app.vault.read(file),
			);
			return { file, contents };
		},
		refetchOnWindowFocus: 'always',
	});

export const useMutationFile = (app: App, file: TFile | undefined) =>
	useMutation({
		mutationKey: ['file', file?.path],
		mutationFn: async (contents: Array<unknown>) => {
			if (!file) {
				throw new Error(`File for mutation does not exist`);
			}
			const stringified = JSON.stringify(contents);
			await app.vault.modify(file, stringified);
		},
	});

export const useFile = (app: App, fileName: string) => {
	const query = useQueryFile(app, fileName);
	const mutation = useMutationFile(app, query.data?.file);
	return { query, mutation };
};
