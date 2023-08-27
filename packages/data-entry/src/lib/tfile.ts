import { either, option, reader } from 'fp-ts';
import { JsonRecord } from 'fp-ts/lib/Json';
import { Option } from 'fp-ts/lib/Option';
import { flow, pipe } from 'fp-ts/lib/function';
import { MetadataCache, TFile, Vault } from 'obsidian';

export { TFile } from 'obsidian';

export const createGetTFileByPath =
  (vault: Pick<Vault, 'getAbstractFileByPath'>) => (path: string) =>
    pipe(
      vault.getAbstractFileByPath(path),
      option.fromNullable,
      either.fromOption(() => new FileNotFoundError(path)),
      either.chainW(
        either.fromPredicate(
          (file): file is TFile => file instanceof TFile,
          (_tfolder) => new FileNotTFileError(path),
        ),
      ),
    );

const createGetFrontmatterByTFile =
  (metadataCache: Pick<MetadataCache, 'getFileCache'>) =>
  (tfile: TFile): Option<JsonRecord> =>
    pipe(
      metadataCache.getFileCache(tfile),
      option.fromNullable,
      option.chainNullableK((cachedMetadata) => cachedMetadata.frontmatter),
    );

export const createGetFrontmatterByPath = (app: {
  vault: Pick<Vault, 'getAbstractFileByPath'>;
  metadataCache: Pick<MetadataCache, 'getFileCache'>;
}) =>
  pipe(
    createGetTFileByPath(app.vault),
    reader.map(
      either.chainW(
        flow(
          createGetFrontmatterByTFile(app.metadataCache),
          either.fromOption(() => 'File does not contain frontmatter'),
        ),
      ),
    ),
  );

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
    const message = `Could not modify file at "${filePath}"`;
    super(message);
    this.name = this.constructor.name;
  }
}

export type FileError =
  | FileNotTFileError
  | FileNotFoundError
  | FileRenamedError
  | FileModifiedError;
