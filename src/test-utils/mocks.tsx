import { createTheme } from '@mui/system';
import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { ProviderProps } from '../components';

export interface MockOptions {
  clientOptions?: QueryClientConfig;
}

export interface MockResult {}

export const createProviderPropsWithoutChildren = ({
  clientOptions,
}: MockOptions = {}): Omit<ProviderProps, 'children'> => {
  const client = new QueryClient(clientOptions);
  const theme = createTheme();

  return { queryClient: client, materialTheme: theme };
};

export type FileOptions = string;

export interface FolderOptions
  extends Record<string, FileOptions | FolderOptions | null> {}
