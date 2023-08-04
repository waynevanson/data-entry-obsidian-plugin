import { useReducer } from 'react';

export function useToggle(initialValue: boolean) {
	return useReducer((toggle) => !toggle, initialValue);
}
