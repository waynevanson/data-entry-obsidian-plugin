import { Events } from './events';
import { createDataAdapter } from './data-adapter';
import type { DataAdapter, MockVaultParams } from 'obsidian';

export function createVaultMock(params: MockVaultParams): Vault {
  return new Vault(params);
}

export class Vault extends Events {
  public adapter: ReturnType<typeof createDataAdapter> & DataAdapter;

  constructor(params: MockVaultParams) {
    super();
    this.adapter = createDataAdapter(params.root);
  }

  getAbstractFileByPath(this: this, path: string): TAbstractFile | null {
    const exists = this.adapter.existsSync(path);
    if (!exists) return null;
    else {
      return new TFile({
        name: path,
        path,
        vault: this,
        parent: null,
      });
    }
  }

  async read(this: this, file: TFile) {
    return this.adapter.read(file.path);
  }
}

type Properties<T> = { [P in keyof T]: T[P] };

export abstract class TAbstractFile {
  vault!: Vault;
  path!: string;
  name!: string;
  parent!: TFolder | null;

  constructor(properties: Properties<TAbstractFile>) {
    Object.assign(this, properties);
  }
}

export class TFolder extends TAbstractFile {
  children!: TAbstractFile[];

  constructor(properties: Properties<TFolder>) {
    super(properties);
    Object.assign(this, properties);
  }

  isRoot(): boolean {
    return this.parent == null;
  }
}

export class TFile extends TAbstractFile {
  constructor(properties: Properties<TFile>) {
    super(properties);
    Object.assign(this, properties);
  }

  // get basename(): string {
  //   return '';
  // }

  // get stat(): FileStats {
  //   return;
  // }

  // get extension(): string {
  //   return;
  // }
}
