import { useState } from 'react';

export const useCursor = (max: number | undefined = Infinity) => {
	const [value, valueSet] = useState<number | null>(null);

	const incrementBy = (count: number) =>
		valueSet((cursor) => {
			if (cursor === null) return null;
			const next = cursor + count;
			return next > max ? max : next;
		});

	const increment = () => incrementBy(1);
	const decrementBy = (count: number) => incrementBy(-count);
	const decrement = () => decrementBy(1);
	const clear = () => valueSet(null);

	return {
		value,
		increment,
		decrement,
		decrementBy,
		incrementBy,
		clear,
	};
};
