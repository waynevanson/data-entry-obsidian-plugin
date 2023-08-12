import { Notice, TAbstractFile, TFile, Vault } from 'obsidian';
import { useCallback, useEffect, useMemo, useState } from 'react';

export class FileNotFoundError extends Error {
  constructor(filePath: string) {
    const message = `Unable to find file at path "${filePath}".`;
    super(message);
    this.name = this.constructor.name;
  }
}

export class FileNotTFileError extends Error {
  constructor(filePath: string) {
    const message = `Cannot read contents of "${filePath}" as it is not a file.`;
    super(message);
    this.name = this.constructor.name;
  }
}

export class FileNotReadError extends Error {
  constructor(filePath: string) {
    const message = `Cannot read contents of "${filePath}" as it is not a file.`;
    super(message);
    this.name = this.constructor.name;
  }
}

export class FileRenamedError extends Error {
  constructor(oldFilePath: string, newFilePath: string) {
    const message = `"${oldFilePath}" has been renamed to "${newFilePath}"`;
    super(message);
    this.name = this.constructor.name;
  }
}

export type FileError =
  | FileNotTFileError
  | FileNotFoundError
  | FileRenamedError;

export const useFileObsidian = (
  vault: Vault,
  filePath: string,
  lazy = false,
) => {
  const [data, dataSet] = useState<string | null>(null);
  const [loading, loadingSet] = useState(false);
  const [error, errorSet] = useState<FileError | null>(null);

  const read = useCallback(
    async (file: TAbstractFile) => {
      if (!(file instanceof TFile)) return;
      if (file.path !== filePath) return;

      loadingSet(true);
      errorSet(null);

      file.vault
        .read(file)
        .then((contents) => dataSet(contents))
        .catch((error) => errorSet(error as never))
        .finally(() => loadingSet(false));
    },
    [filePath],
  );

  const file = useMemo(() => {
    const file = vault.getAbstractFileByPath(filePath);

    if (file == null) {
      errorSet(new FileNotFoundError(filePath));
    } else if (!(file instanceof TFile)) {
      errorSet(new FileNotTFileError(filePath));
    } else {
      return file;
    }

    return null;
  }, [vault, filePath]);

  const fetch = useCallback(() => {
    file != null && read(file);
  }, [file, read]);

  // load initial value
  useEffect(() => {
    if (lazy) return;
    else fetch();
  }, [fetch, lazy]);

  useEffect(() => {
    const create = vault.on('create', read);

    const delete_ = vault.on('delete', async (file) => {
      if (!(file instanceof TFile)) return;
      if (file.path !== filePath) return;

      dataSet(null);
      errorSet(null);
    });

    const modify = vault.on('modify', read);
    const rename = vault.on('rename', (file, oldPath) => {
      if (oldPath !== filePath) return;
      errorSet(new FileRenamedError(filePath, file.path));
    });

    return () =>
      [create, delete_, modify, rename].forEach((ref) => vault.offref(ref));
  }, [vault, filePath, read]);

  // todo - error handle
  const modify = useCallback(
    (contents: string) => {
      if (file == null) return;
      vault
        .modify(file, contents)
        .then(() => new Notice('File as been saved!'));
    },
    [vault, file],
  );

  return { data, loading, error, fetch, modify };
};

// todo - add listeners when files are modified
// todo - e2e https://www.electronjs.org/docs/latest/tutorial/testing-on-headless-ci
