import { Endomorphism } from 'fp-ts/lib/Endomorphism';
import { Json, JsonRecord } from 'fp-ts/lib/Json';
import { FileManager, MetadataCache, TFile, Vault } from 'obsidian';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useFrontmatter(
  app: {
    vault: Pick<Vault, 'modify' | 'getAbstractFileByPath' | 'on' | 'offref'>;
    metadataCache: Pick<MetadataCache, 'getFileCache'>;
    fileManager: Pick<FileManager, 'processFrontMatter'>;
  },
  filePath: string,
) {
  const file = useMemo(() => {
    const file = app.vault.getAbstractFileByPath(filePath);

    if (file == null) {
      errorSet(new FileNotFoundError(filePath));
    } else if (!(file instanceof TFile)) {
      errorSet(new FileNotTFileError(filePath));
    } else {
      return file;
    }

    return null;
  }, [app.vault, filePath]);

  const getData = useCallback(() => {
    if (file == null) return null;
    const data = app.metadataCache.getFileCache(file)?.frontmatter ?? null;
    return data;
  }, [app.metadataCache, file]);

  const [data, dataSet] = useState<Json | null>(getData);
  const [error, errorSet] = useState<FileError | null>(null);

  const read = useCallback(
    (file: TFile) => {
      const data = app.metadataCache.getFileCache(file)?.frontmatter ?? null;
      dataSet(data);
    },
    [app.metadataCache],
  );

  // listen to changes on file when it changes.
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
      errorSet(new FileRenamedError(filePath, file.path));
    });

    return () =>
      [create, delete_, modify, rename].forEach((ref) => app.vault.offref(ref));
  }, [app.vault, filePath, read]);

  const modify = useCallback(
    (f: Endomorphism<JsonRecord>) => {
      if (file == null) return;
      //todo - add async loading
      app.fileManager
        .processFrontMatter(file, (data) => {
          const cache = { ...data };
          Object.keys(data).forEach((key) => {
            delete data[key];
          });
          Object.assign(data, f(cache));
        })
        .catch(() => errorSet(new FileModifiedError(file.path)));
    },
    [app.fileManager, file],
  );

  return { data, error, modify };
}

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

export class FileModifiedError extends Error {
  constructor(filePath: string) {
    const message = `Could not moidy file at "${filePath}"`;
    super(message);
    this.name = this.constructor.name;
  }
}

export type FileError =
  | FileNotTFileError
  | FileNotFoundError
  | FileRenamedError
  | FileModifiedError;
