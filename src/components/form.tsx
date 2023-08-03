import { JsonFormsCore } from '@jsonforms/core';
import {
	materialCells,
	materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import * as React from 'react';

export interface FormedProps
	extends Pick<
		Parameters<typeof JsonForms>[0],
		'data' | 'schema' | 'uischema' | 'onChange'
	> {
	onSubmit?: () => void;
	errors: NonNullable<JsonFormsCore['errors']>;
	submitLabel?: string;
}

export const Formed = ({
	submitLabel,
	onSubmit,
	errors,
	...jsonForms
}: FormedProps) => (
	<form
		onSubmit={(event) => {
			event.preventDefault();
			onSubmit?.();
		}}
	>
		<JsonForms
			cells={materialCells}
			renderers={materialRenderers}
			{...jsonForms}
		/>

		<button type="submit" disabled={errors.length > 0}>
			{submitLabel ?? 'Submit'}
		</button>
	</form>
);
