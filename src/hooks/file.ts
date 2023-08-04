import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Notice, TFile } from 'obsidian';

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
			const stringified = JSON.stringify(contents, null, 2);
			await app.vault.modify(file, stringified);
		},
		onSuccess: () => {
			new Notice('File has been saved!');
		},
	});

export const useFile = (app: App, fileName: string) => {
	const query = useQueryFile(app, fileName);
	const mutation = useMutationFile(app, query.data?.file);
	return { query, mutation };
};
