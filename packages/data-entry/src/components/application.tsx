import { createDefaultValue } from '@jsonforms/core';
import { Alert } from '@mui/material';
import * as React from 'react';
import { ReactNode, useCallback, useState } from 'react';
import { Form } from '../hooks';
import { useFrontmatter } from '../hooks/frontmatter';
import { useApplication } from './context';
import { Formed } from './form';

export function Application() {
  const application = useApplication();
  const frontmatter = useFrontmatter(application.app, application.fileName);
  const [defaultForm] = useState(
    () => createDefaultValue(application.schema) as Form,
  );
  const [form, formSet] = useState<Form>(defaultForm);
  // todo - update form contents when the file changes

  const [errors, errorsSet] = useState<Array<unknown>>([]);

  const handleSubmit = useCallback(() => {
    frontmatter.modify((json) => ({ ...json, data: form as never }));
  }, [form, frontmatter]);

  return (
    <ErrorBoundary>
      {frontmatter.error && (
        <Alert severity="error">{frontmatter.error.message}</Alert>
      )}
      <Formed
        errors={errors as never}
        onSubmit={handleSubmit}
        submit="Update"
        schema={application.schema ?? undefined}
        uischema={application.uischema ?? undefined}
        data={form}
        onChange={({ data, errors }) => {
          formSet(data);
          errorsSet(errors ?? []);
        }}
      />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<
  { children?: ReactNode },
  { hasError: false } | { hasError: true; error: unknown }
> {
  constructor(props: { children?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div>
        <h1>Something went wrong.</h1>
        <p>Please see the error that was thrown below for more information.</p>
        <pre>
          <code>{String(this.state.error)}</code>
        </pre>
      </div>
    );
  }
}
