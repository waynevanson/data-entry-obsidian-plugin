import { useMemo } from 'react';

export const useMax = (array: Array<unknown> | undefined) =>
	useMemo(
		() => (array?.length != null ? array.length - 1 : null),
		[array?.length],
	);
