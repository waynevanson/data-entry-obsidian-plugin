import { useEffect, useState } from 'react';

/**
 * @summary
 * Provides operations for the cursor.
 * Cursor is optional because it may be operating on an empty list.
 */
export const useCursor = (min = 0, max: number | null) => {
  const [value, valueSet] = useState<number | null>(null);

  // update cursor when max changes and the cursor is null
  useEffect(() => {
    if (value != null || max == null) return;
    valueSet(max);
  }, [max, value]);

  const incrementBy = (count: number) =>
    valueSet((cursor) => {
      if (cursor === null) return null;
      const next = cursor + count;
      return next > max! ? max! : next <= min ? min : next;
    });

  const increment = () => incrementBy(1);
  const decrementBy = (count: number) => incrementBy(-count);
  const decrement = () => decrementBy(1);
  const clear = () => valueSet(null);
  const end = () => valueSet(max);
  const start = () => valueSet(min);

  return {
    value,
    valueSet,
    increment,
    decrement,
    decrementBy,
    incrementBy,
    clear,
    start,
    end,
    fetch,
  };
};
