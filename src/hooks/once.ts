import { max } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { Refinement } from 'fp-ts/lib/Refinement';
import { useState, useEffect } from 'react';

export interface UseOnceParams<A, B extends A> {
	value: A;
	predicate: Refinement<A, B>;
	onOnce?: (value: B) => void;
}

export function useOnce<A, B extends A>({
	predicate,
	onOnce,
	value,
}: UseOnceParams<A, B>) {
	const [providedOnMount, providedOnMountSet] = useState(false);
	// Only set the cursor as the max value once.
	useEffect(() => {
		if (!providedOnMount && predicate(value)) return;
		providedOnMountSet(true);
		onOnce?.(value as B);
	}, [providedOnMount, max, providedOnMountSet]);
}
