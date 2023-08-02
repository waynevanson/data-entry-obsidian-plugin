import { useCursor } from './cursor';
import * as rtl from '@testing-library/react';

describe(useCursor, () => {
	it('should set max as the default value', () => {
		const max = 10;
		const hooked = rtl.renderHook(() => useCursor(max));
		expect(hooked.result.current.value).toBe(max);
	});

	it('should decrement the value by one when decrement is called', () => {
		const hooked = rtl.renderHook(() => useCursor(10));
		rtl.act(() => hooked.result.current.decrement());
		expect(hooked.result.current.value).toBe(9);
	});

	it.only('should not update the cursor when a new max value is provided', async () => {
		const hooked = rtl.renderHook(useCursor, { initialProps: 10 });
		hooked.rerender(11);
		await rtl.waitFor(() => expect(hooked.result.current.value).toBe(10));
	});
});
