import { Theme } from '@mui/material';
import { ApplicationProps as ApplicationContext } from '../components';
import '@waynevanson/obsidian-mocks';
//@ts-expect-error
import { MockVaultParams, Vault, createVaultMock } from 'obsidian';

export interface MockOptions {
  application?: Partial<Omit<ApplicationContext, 'vault'>> & {
    vault: MockVaultParams;
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
