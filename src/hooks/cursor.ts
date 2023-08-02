import { useEffect, useState } from 'react';

/**
 * @summary
 * Provides operations for the cursor.
 * @returns
 */
export const useCursor = (max: number | null) => {
	const [providedOnMount, providedOnMountSet] = useState(false);
	const [value, valueSet] = useState<number | null>(null);

	// Only set the cursor as the max value once.
	useEffect(() => {
		if (providedOnMount || max == null || value != null) return;
		providedOnMountSet(true);
		valueSet(max);
	}, [providedOnMount, max, providedOnMountSet]);

	const incrementBy = (count: number) =>
		valueSet((cursor) => {
			if (cursor === null) return null;
			const next = cursor + count;
			return next > max! ? max! : next <= 0 ? 0 : next;
		});

	const increment = () => incrementBy(1);
	const decrementBy = (count: number) => incrementBy(-count);
	const decrement = () => decrementBy(1);
	const clear = () => valueSet(null);

	return {
		value,
		valueSet,
		increment,
		decrement,
		decrementBy,
		incrementBy,
		clear,
	};
};
