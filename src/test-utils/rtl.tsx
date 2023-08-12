export * from '@testing-library/react';
import * as rtl from '@testing-library/react';
import React from 'react';
import { Providers } from '../components';
import {
  MockOptions,
  MockResult,
  createProviderPropsWithoutChildren,
} from './mocks';

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
  const providerProps = createProviderPropsWithoutChildren(options);

  const wrapper: React.JSXElementConstructor<{
    children: React.ReactElement;
  }> = ({ children }) => <Providers {...providerProps}>{children}</Providers>;

  const mocks = {};

  const rendered = rtl.render(app, { ...options, wrapper });

  return { rendered, mocks };
}
