import { App } from 'obsidian';
import { createContext, useContext } from 'react';
import { ApplicationConfiguration } from '../common';

export interface ApplicationProps {
  app: App;
  config: ApplicationConfiguration;
}

const context = createContext<ApplicationProps>(null as never);

export const { Provider: ApplicationProvider } = context;
export const useApplication = () => useContext(context);
