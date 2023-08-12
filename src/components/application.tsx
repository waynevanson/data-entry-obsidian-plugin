import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { useState } from 'react';
import { Main, MainProps } from './main';
import { Providers } from './providers';
import { useTheme } from './material';

export const Application = (props: MainProps) => {
  const [queryClient] = useState(new QueryClient());
  return (
    <Providers queryClient={queryClient} materialTheme={useTheme()}>
      <Main {...props} />
    </Providers>
  );
};
