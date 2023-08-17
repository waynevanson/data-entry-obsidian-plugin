import { Theme } from '@mui/material';
import { MainProps as ApplicationContext } from '../components';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockOptions {
  application?: Partial<ApplicationContext>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockResult {}

export interface MockContext {
  theme: Theme;
  application: ApplicationContext;
}
