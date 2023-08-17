import { Events } from '../events';
import { Directory, createDataAdapter } from './data-adapter';
import { DataAdapter, FileStats } from 'obsidian';

export class Vault extends Events {
  public adapter: ReturnType<typeof createDataAdapter> & DataAdapter;

  constructor(system: Directory = {}) {
    super();
    this.adapter = createDataAdapter(system);
  }

  getAbstractFileByPath(this: this, path: string): TAbstractFile | null {
    const exists = this.adapter.existsSync(path);
    if (!exists) return null;
    else {
      const inner = {
        name: path,
        path,
        vault: this,
        parent: null,
      };

      const tfile = new TFile();
      Object.assign(tfile, inner);
      return tfile;
    }
  }

  async read(this: this, file: TFile) {
    return this.adapter.read(file.path);
  }
}

export abstract class TAbstractFile {
  vault: Vault;
  path: string;
  name: string;
  parent: TFolder | null;
}

export class TFolder extends TAbstractFile {
  children: TAbstractFile[];
  isRoot(): boolean {
    return false;
  }
}

export class TFile extends TAbstractFile {
  stat: FileStats;
  basename: string;
  extension: string;
}
