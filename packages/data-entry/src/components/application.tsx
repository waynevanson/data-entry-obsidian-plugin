import { JsonSchema, createDefaultValue } from '@jsonforms/core';
import { Alert } from '@mui/material';
import { option, readonlyRecord } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import * as React from 'react';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useFrontmatter } from '../hooks/frontmatter';
import { useApplication } from './context';
import { Formed } from './form';
import { match } from '../lib/sum';

export function Application() {
  const { app, config } = useApplication();
  const frontmatter = {
    datasource: useFrontmatter(app, config.datasource.file.path),
    schema: useFrontmatter(
      app,
      pipe(
        config.schema,
        match({ file: (file) => file.path, inline: () => null }),
      ),
    ),
    uischema: useFrontmatter(
      app,
      pipe(
        config.uischema,
        option.fromNullable,
        option.chainNullableK(
          match({ file: (file) => file.path, inline: () => null }),
        ),
        option.toNullable,
      ),
    ),
  };

  const frontmatterErrors = pipe(
    frontmatter,
    readonlyRecord.fromRecord,
    readonlyRecord.map((frontmatter) => frontmatter.error),
    readonlyRecord.filterMap(option.fromNullable),
    readonlyRecord.collect((type, error) => `${type}: ${error}`),
  ).join('\n');

  const schema = useMemo(
    () =>
      pipe(
        config.schema,
        match({
          inline: (inline) => inline as JsonSchema,
          file: (file) =>
            (frontmatter.schema.data?.[file.frontmatter] as JsonSchema) ?? null,
        }),
      ),
    [config.schema, frontmatter.schema.data],
  );

  const cached = useMemo(
    () => frontmatter.datasource.data?.[config.datasource.file.frontmatter],
    [config.datasource.file.frontmatter, frontmatter.datasource.data],
  );

  const [form, formSet] = useState<unknown>(
    () => cached ?? createDefaultValue(schema),
  );

  const uischema = useMemo(
    () =>
      pipe(
        config.uischema,
        option.fromNullable,
        option.chainNullableK(
          match({
            inline: (inline) => inline as JsonSchema,
            file: (file) =>
              frontmatter.uischema.data?.[
                file.frontmatter
              ] as JsonSchema | null,
          }),
        ),
        option.toNullable,
      ),
    [config.uischema, frontmatter.uischema.data],
  );

  const [errors, errorsSet] = useState<Array<unknown>>([]);

  const handleSubmit = useCallback(() => {
    frontmatter.datasource.modify((json) => {
      json[config.datasource.file.frontmatter] = form;
    });
  }, [config.datasource.file.frontmatter, form, frontmatter.datasource]);

  return (
    <ErrorBoundary>
      {frontmatterErrors !== '' && (
        <Alert severity="error">{frontmatterErrors}</Alert>
      )}
      <Formed
        errors={errors as never}
        onSubmit={handleSubmit}
        submit="Update"
        schema={schema}
        uischema={(uischema as never) ?? undefined}
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
  { hasError: false } | { hasError: true; error: Error }
> {
  constructor(props: { children?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    console.error(this.state.error);
    return (
      <div>
        <h2>Something went wrong.</h2>
        <p>Please see the error that was thrown below for more information.</p>
        <pre>
          <code>{String(this.state.error)}</code>
          <code>{this.state.error?.stack}</code>
        </pre>
      </div>
    );
  }
}
