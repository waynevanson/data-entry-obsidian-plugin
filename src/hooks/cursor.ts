import { useEffect, useState } from 'react';

/**
 * @summary
 * Provides operations for the cursor.
 * @returns
 */
export const useCursor = (max: number | null) => {
	const [cache, cacheSet] = useState<number | null>(null);
	const [value, valueSet] = useState<number | null>(null);

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
	const end = () => valueSet(max);
	const start = () => valueSet(0);
	const store = () => {
		cacheSet(value);
		valueSet(null);
	};
	const fetch = () => {
		valueSet(cache);
		cacheSet(null);
	};

	return {
		value,
		valueSet,
		cache,
		cacheSet,
		increment,
		decrement,
		decrementBy,
		incrementBy,
		clear,
		start,
		end,
		store,
		fetch,
	};
};
