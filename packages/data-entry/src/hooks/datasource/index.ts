import { Vault } from 'obsidian';
import { Datasource } from '../../common';
import { useFile } from './file';
import { useFolder } from './folder';

export * from './file';
export * from './folder';

export function useDatasource(
  vault: Vault,
  datasource: Datasource,
  index: number,
) {
  const folderPath = 'folder' in datasource ? datasource.folder : null;
  const folder = useFolder(vault, folderPath);

  const filePath =
    'file' in datasource ? datasource.file.path : folder.filePaths[index];

  const file = useFile(vault, filePath);
  const error = folder.error ?? file.error;
  // todo - error handle parse
  const json: unknown = JSON.parse(file as never);
  const data =
    'folder' in datasource
      ? (json as unknown)
      : (json as Array<unknown>)[index] ?? null;

  return { data, error, loading: file.loading };
}
