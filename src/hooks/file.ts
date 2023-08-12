import { useMutation, useQuery } from '@tanstack/react-query';
import { App, Notice, TAbstractFile, TFile, Vault } from 'obsidian';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DataEntryErrorName = 'FileNotFound';

export class DataEntryError<K extends DataEntryErrorName> extends Error {
  private constructor(name: K) {
    const messageByName: Record<DataEntryErrorName, string> = {
      FileNotFound: '',
    };
    const message = messageByName[name];
    super(message);
  }

  static create<K extends DataEntryErrorName>(name: K): DataEntryError<K> {
    return new DataEntryError(name);
  }
}

export const useFileObsidian = (app: App, filePath: string, lazy = false) => {
  const [data, dataSet] = useState<string | null>(null);
  const [loading, loadingSet] = useState(false);
  const [error, errorSet] = useState<string | null>(null);

  const read = useCallback(
    async (file: TAbstractFile) => {
      if (!(file instanceof TFile)) return;
      if (file.path !== filePath) return;

      loadingSet(true);
      errorSet(null);

      file.vault
        .read(file)
        .then((contents) => dataSet(contents))
        .catch((error) => errorSet(String(error)))
        .finally(() => loadingSet(false));
    },
    [filePath],
  );

  const file = useMemo(() => {
    const file = app.vault.getAbstractFileByPath(filePath);

    if (file == null) {
      errorSet(`Unable to find file at path "${filePath}".`);
    } else if (!(file instanceof TFile)) {
      errorSet(`Cannot read contents of "${filePath}" as it is not a file.`);
    } else {
      return file;
    }

    return null;
  }, [app.vault, filePath]);

  const fetch = useCallback(() => {
    if (file == null) {
      errorSet(`Unable to find file at path "${filePath}".`);
    } else if (!(file instanceof TFile)) {
      errorSet(`Cannot read contents of "${filePath}" as it is not a file.`);
    } else if (file.path === filePath) {
      read(file);
    }
  }, [file, filePath, read]);

  // load initial value
  useEffect(() => {
    if (lazy) return;
    else fetch();
  }, [app.vault, fetch, filePath, lazy, read]);

  useEffect(() => {
    const create = app.vault.on('create', read);

    const delete_ = app.vault.on('delete', async (file) => {
      if (!(file instanceof TFile)) return;
      if (file.path !== filePath) return;

      dataSet(null);
      errorSet(null);
    });

    const modify = app.vault.on('modify', read);
    const rename = app.vault.on('rename', (file, oldPath) => {
      if (oldPath !== filePath) return;
      errorSet(`"${filePath}" has been renamed to "${file.path}"`);
    });

    return () =>
      [create, delete_, modify, rename].forEach((ref) => app.vault.offref(ref));
  }, [app.vault, filePath, read]);

  const modify = useCallback(
    (contents: string) => {
      file != null && app.vault.modify(file, contents);
    },
    [app.vault, file],
  );

  return { data, loading, error, fetch, modify };
};

// todo - add listeners when files are modified
// todo - e2e https://www.electronjs.org/docs/latest/tutorial/testing-on-headless-ci
export const useQueryFile = (vault: Vault, fileName: string) =>
  useQuery({
    retryDelay: 500,
    queryKey: [fileName],
    queryFn: async () => {
      const file = vault.getAbstractFileByPath(fileName);

      if (file == null) {
        return null;
      } else if (!(file instanceof TFile)) {
        throw new Error(`File is not an instance of 'TFile'`);
      }

      const contents: Array<unknown> = JSON.parse(await vault.read(file));

      return { file, contents };
    },
    refetchOnWindowFocus: 'always',
  });

export const useQueryFileSave = (
  vault: Vault,
  fileName: string,
  onSuccess: () => void,
) =>
  useMutation({
    mutationKey: [fileName],
    mutationFn: (json: unknown) =>
      vault.create(fileName, JSON.stringify(json, null, 2)),
    onSuccess,
  });

export const useMutationFile = (vault: Vault, file: TFile | undefined) =>
  useMutation({
    mutationKey: ['file', file?.path],
    mutationFn: async (contents: Array<unknown>) => {
      if (!file) {
        throw new Error(`File for mutation does not exist`);
      }
      const stringified = JSON.stringify(contents, null, 2);
      await vault.modify(file, stringified);
    },
    onSuccess: () => {
      new Notice('File has been saved!');
    },
  });

export const useFile = (vault: Vault, fileName: string) => {
  const read = useQueryFile(vault, fileName);
  const create = useQueryFileSave(vault, fileName, () => read.refetch());
  const write = useMutationFile(vault, read.data?.file);

  return { read, write, create };
};
