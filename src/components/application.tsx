import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { useState } from 'react';
import { Main, MainProps } from './main';
import { Providers } from './providers';
import { theme } from './styled';

export const Application = (props: MainProps) => {
  const [queryClient] = useState(new QueryClient());
  return (
    <Providers query={queryClient} theme={theme}>
      <Main {...props} />
    </Providers>
  );
};
