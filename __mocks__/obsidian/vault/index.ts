import { Events } from '../events';
import { Directory, createDataAdapter } from './data-adapter';
import { DataAdapter } from 'obsidian';

export class Vault extends Events {
  public adapter: DataAdapter;

  constructor(system: Directory) {
    super();
    this.adapter = createDataAdapter(system);
  }
}
