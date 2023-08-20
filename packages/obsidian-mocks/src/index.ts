export * from './events';
export * from './vault';

import 'obsidian';
import { Directory } from './data-adapter';

declare module 'obsidian' {
  export interface EventRef {
    mockName: string;
    mockCallback: (...data: Array<unknown>) => void;
  }

  export interface MockVaultParams {
    root: Directory;
  }

  export function createVaultMock(params: MockVaultParams): Vault;
}
