export * from '@testing-library/react';
import * as rtl from '@testing-library/react';
import React from 'react';
import { ApplicationProvider } from '../components';
import { MockOptions, MockResult, createMocks } from './mocks';
import { ThemeProvider, createTheme } from '@mui/material';
import deepmerge from 'deepmerge';

//todo-add types here
export interface RenderOptions<
  Q extends rtl.Queries = typeof rtl.queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> extends Omit<rtl.RenderOptions<Q, Container, BaseElement>, 'wrapper'>,
    MockOptions {}

export interface RenderResult<
  Q extends rtl.Queries = typeof rtl.queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> {
  rendered: rtl.RenderResult<Q, Container, BaseElement>;
  mocks: MockResult;
}

export interface Render<
  Q extends rtl.Queries = typeof rtl.queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> {
  (
    app: React.ReactElement,
    options?: RenderOptions<Q, Container, BaseElement>,
  ): RenderResult<Q, Container, BaseElement>;
}

export function render<
  Q extends rtl.Queries = typeof rtl.queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  app: React.ReactElement,
  options?: RenderOptions<Q, Container, BaseElement>,
): RenderResult<Q, Container, BaseElement> {
  const theme = createTheme();
  const { vault: vaultOptions, ...most } = deepmerge(
    {} as never,
    options?.application ?? {},
  );
  const mocks = createMocks({ vault: { root: vaultOptions } });
  const application = { ...most, vault: mocks.vault };

  const wrapper: React.JSXElementConstructor<{
    children: React.ReactElement;
  }> = ({ children }) => (
    <ThemeProvider theme={theme}>
      <ApplicationProvider value={application}>{children}</ApplicationProvider>
    </ThemeProvider>
  );

  const rendered = rtl.render(app, { ...options, wrapper });

  return { rendered, mocks };
}
