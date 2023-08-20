import { Theme } from '@mui/material';
import { MainProps as ApplicationContext } from '../components';
import { MockVaultParams, Vault, createVaultMock } from 'obsidian';
import { Directory } from '@waynevanson/obsidian-mocks/dist/vault/data-adapter';

export interface MockOptions {
  application?: Partial<Omit<ApplicationContext, 'vault'>> & {
    vault: Directory;
  };
}

export interface MockResult {
  vault: Vault;
}

export interface MockContextOptions {
  vault?: MockVaultParams;
}

export interface MockContextResult {
  theme: Theme;
  application: ApplicationContext;
}

export const createMocks = (options?: MockContextOptions): MockResult => ({
  vault: createVaultMock(options?.vault ?? { root: {} }),
});
