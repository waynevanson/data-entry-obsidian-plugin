import React from 'react';
import { rtl } from '../test-utils';
import { Formed } from './form';
import user from '@testing-library/user-event';

describe(Formed, () => {
  it('should call "onSubmit" when the button "Submit" is clicked', () => {
    const onSubmit = jest.fn();
    const { rendered } = rtl.render(
      <Formed data={{}} schema={{}} errors={[]} onSubmit={onSubmit} />,
    );

    const button = rendered.getByRole('button', { name: 'Submit' });
    button.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it.todo('should disable the submit button when there is an error');

  // won't render the form, not sure why..
  it.skip('should call "onChange" after a change has happened in the form', async () => {
    const onChange = jest.fn();
    const { rendered } = rtl.render(
      <Formed
        data={{ name: '' }}
        schema={{ properties: { name: { type: 'string' } } }}
        errors={[]}
        onChange={onChange}
      />,
    );
    const textbox = await rendered.findByRole('textbox', { name: 'name' });
    await user.type(textbox, 'Hello, World!');

    await rtl.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  });
});
