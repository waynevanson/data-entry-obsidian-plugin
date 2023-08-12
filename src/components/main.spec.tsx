import React from 'react';
import { Main } from './main';
import { rtl } from '../test-utils';

describe(Main, () => {
  it.skip('should render', async () => {
    const { rendered } = rtl.render(
      <Main
        vault={{} as never}
        fileName="hello.md"
        schema={{
          properties: { name: { type: 'string' } },
        }}
      />,
    );

    const input = await rendered.findByRole('textbox', { name: 'name' });

    expect(input).toBeInTheDocument();
  });
});
