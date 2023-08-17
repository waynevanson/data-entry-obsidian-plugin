import { Theme } from '@mui/material';
import { MainProps as ApplicationContext } from '../components';
import { Vault } from 'obsidian';
import { Directory } from '../../__mocks__/obsidian/vault/data-adapter';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockOptions {
  application?: Partial<Omit<ApplicationContext, 'vault'>> & {
    vault: Directory;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockResult {
  vault: Vault;
}

export interface MockContextOptions {
  vault: Directory;
}

export interface MockContextResult {
  theme: Theme;
  application: ApplicationContext;
}

export const createMocks = (options?: MockContextOptions): MockResult => ({
  //@ts-expect-error
  vault: new Vault(options?.vault),
});
