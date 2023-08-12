import { TFile, TFolder, Vault } from 'obsidian';
import { Datasource } from '../common';
import { FileNotTFileError, useFileObsidian } from './file';
import { useMemo, useState } from 'react';

export class FolderNotFoundError extends Error {
  constructor(folderPath: string) {
    const message = `Unable to find file at path "${folderPath}".`;
    super(message);
    this.name = this.constructor.name;
  }
}

export class FolderNotTFolderError extends Error {
  constructor(folderPath: string) {
    const message = `Cannot read contents of "${folderPath}" as it is not a file.`;
    super(message);
    this.name = this.constructor.name;
  }
}

export class FileRenamedError extends Error {
  constructor(oldFolderPath: string, newFolderPath: string) {
    const message = `"${oldFolderPath}" has been renamed to "${newFolderPath}"`;
    super(message);
    this.name = this.constructor.name;
  }
}

export type FolderError =
  | FolderNotFoundError
  | FileNotTFileError
  | FileRenamedError;

export function useFolderObsidian(vault: Vault, folderPath: string | null) {
  const [error, errorSet] = useState<FolderError | null>(null);

  const folder = useMemo(() => {
    if (folderPath == null) return null;
    const folder = vault.getAbstractFileByPath(folderPath);
    if (folder == null) {
      errorSet(new FolderNotFoundError(folderPath));
    } else if (!(folder instanceof TFolder)) {
      errorSet(new FolderNotTFolderError(folderPath));
    } else {
      return folder;
    }

    return null;
  }, [folderPath, vault]);

  const filePaths = useMemo(
    () =>
      folder?.children
        .filter(
          (abstractFile): abstractFile is TFile =>
            abstractFile instanceof TFile,
        )
        .map((file) => file.path) ?? [],
    [folder?.children],
  );

  return { filePaths, error };
}

export function useDatasource(
  vault: Vault,
  datasource: Datasource,
  index: number,
) {
  const folderPath = 'folder' in datasource ? datasource.folder : null;
  const folder = useFolderObsidian(vault, folderPath);

  const filePath =
    'file' in datasource ? datasource.file : folder.filePaths[index];

  const file = useFileObsidian(vault, filePath);
  const error = folder.error ?? file.error;
  // todo - error handle parse
  const json: unknown = JSON.parse(file as never);
  const data =
    'folder' in datasource
      ? (json as unknown)
      : (json as Array<unknown>)[index] ?? null;

  return { data, error, loading: file.loading };
}
