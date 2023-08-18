import { useEffect } from 'react';

export const useConsole = (struct: Record<string, unknown>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => console.debug(struct), Object.keys(struct));
};
