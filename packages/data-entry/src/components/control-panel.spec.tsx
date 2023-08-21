import React from 'react';
import { ControlPanel } from './control-panel';
import * as rtl from '@testing-library/react';

describe(ControlPanel, () => {
  it.skip('should look aesthetic', () => {
    const rendered = rtl.render(<ControlPanel count={1} newMode page={1} />);
    expect(rendered.container).toMatchImageSnapshot();
  });

  it('should show the button "Create" when new mode is off', () => {
    const rendered = rtl.render(
      <ControlPanel count={1} newMode={false} page={1} />,
    );

    const button = rendered.getByRole('button', { name: 'Create ->' });
    expect(button).toBeInTheDocument();
  });

  it('should show the button "Back to item" when new mode is off', () => {
    const rendered = rtl.render(
      <ControlPanel count={1} newMode={true} page={1} />,
    );

    const button = rendered.getByRole('button', { name: '<- Back to item' });
    expect(button).toBeInTheDocument();
  });

  it.each([
    [false, 'Create ->'],
    [true, '<- Back to item'],
  ])(
    'should call the "onToggleMode" callback when the button "%s" is called',
    (newMode, name) => {
      const onToggleMode = jest.fn();
      const rendered = rtl.render(
        <ControlPanel
          count={1}
          newMode={newMode}
          page={1}
          onToggleMode={onToggleMode}
        />,
      );

      const button = rendered.getByRole('button', { name });

      button.click();

      expect(onToggleMode).toHaveBeenCalledTimes(1);
    },
  );

  it('should call the "onClear" callback when the button "Clear" is called', () => {
    const onClear = jest.fn();
    const rendered = rtl.render(
      <ControlPanel count={1} page={1} newMode={false} onClear={onClear} />,
    );

    const button = rendered.getByRole('button', { name: 'Clear' });

    button.click();

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
