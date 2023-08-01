import React, { useState } from 'react';
import { Providers } from './providers';
import { Main, MainProps } from './main';
import { QueryClient } from '@tanstack/react-query';

export const Application = (props: MainProps) => {
	const [queryClient] = useState(new QueryClient());
	return (
		<Providers query={queryClient} theme={{}}>
			<Main {...props} />
		</Providers>
	);
};
