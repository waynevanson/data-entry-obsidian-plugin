import { JsonRecord } from 'fp-ts/lib/Json';
import { FileManager, MetadataCache, Notice, TFile, Vault } from 'obsidian';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileNotFoundError,
  FileNotTFileError,
  FileError,
  FileRenamedError,
  FileModifiedError,
} from '../lib/tfile';

export function useFrontmatter(
  app: {
    vault: Pick<Vault, 'modify' | 'getAbstractFileByPath' | 'on' | 'offref'>;
    metadataCache: Pick<MetadataCache, 'getFileCache'>;
    fileManager: Pick<FileManager, 'processFrontMatter'>;
  },
  filePath: string | null,
) {
  const [error, errorSet] = useState<FileError | null>(null);

  const file = useMemo(() => {
    if (filePath == null) return null;
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

  const [data, dataSet] = useState<JsonRecord | null>(getData);

  const read = useCallback(
    (file: TFile) => {
      if (file.path !== filePath) return;
      const data = app.metadataCache.getFileCache(file)?.frontmatter ?? null;
      dataSet(data);
    },
    [app.metadataCache, filePath],
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
    (f: (mutable: any) => void) => {
      if (file == null) return;
      //todo - add async loading
      app.fileManager
        .processFrontMatter(file, (data) => {
          f(data);
        })
        .then(() => new Notice('File has been saved!'))
        .catch(() => errorSet(new FileModifiedError(file.path)));
    },
    [app.fileManager, file],
  );

  return { data, error, modify };
}
