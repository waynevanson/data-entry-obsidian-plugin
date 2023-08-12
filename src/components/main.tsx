import {
  JsonSchema,
  UISchemaElement,
  createDefaultValue,
} from '@jsonforms/core';
import type { TFile, Vault } from 'obsidian';
import * as React from 'react';
import { ReactNode, useMemo, useState } from 'react';
import {
  Form,
  useCursor,
  useFileObsidian,
  useForm,
  useForms,
  useToggle,
} from '../hooks';
import { ControlPanel } from './control-panel';
import { Formed } from './form';
import { Alert, Button, CircularProgress } from '@mui/material';
import { readonlyRecord } from 'fp-ts';

export interface MainProps {
  vault: Vault;
  schema: JsonSchema;
  uischema?: UISchemaElement;
  submit?: string;
  fileName: string;
}

export interface UseQueryFileReturn {
  file: TFile;
  contents: Array<unknown>;
}

export function Main(props: MainProps) {
  const file = useFileObsidian(props.vault, props.fileName);
  const [newMode, newModeToggle] = useToggle(true);
  const [defaultForm] = useState(
    () => createDefaultValue(props.schema) as Form,
  );
  const [created, createdSet] = useState<Form>(defaultForm);
  const jsoned = useMemo(
    () => JSON.parse(file.data as never) as Array<Form> | null,
    [file.data],
  );
  const [forms, formsSet] = useForms(jsoned);
  const max = file.data != null ? readonlyRecord.size(forms) : null;

  // todo - rename to index
  const index = useCursor(0, max);
  const [form, formSet] = useForm({
    newMode,
    cursor: index.value,
    created: [created, createdSet],
    forms: [forms, formsSet],
  });

  const [errors, errorsSet] = useState<Array<unknown>>([]);

  const handleSubmit = () => {
    const array: Array<Form | null> = jsoned ?? [];
    if (newMode) {
      array.push(form);
    } else if (index.value !== null) {
      array[index.value] = form;
    }
    file.modify(JSON.stringify(array, null, 2));
  };

  const count = max != null ? max : 0;
  const page = index.value != null ? index.value + 1 : 0;
  if (file.loading)
    return (
      <Alert action={<CircularProgress color="inherit" />}>
        Loading file {props.fileName}
      </Alert>
    );

  if (file.error) {
    //@ts-expect-error
    return <Alert severity="error">{file.read.error.message}</Alert>;
  }

  if (file.data == null) {
    return (
      <Alert
        severity="warning"
        action={
          <Button
            color="inherit"
            onClick={() => {
              file.modify(JSON.stringify('[]', null, 2));
            }}
          >
            Create File
          </Button>
        }
      >
        File does not exist. Would you like to create it?
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <ControlPanel
        newMode={newMode}
        onClear={() => formSet(defaultForm)}
        onToggleMode={newModeToggle}
        count={count}
        page={page}
        onPageChange={(_, page) => index.valueSet(page - 1)}
      />
      {form != null ? (
        <Formed
          errors={errors as never}
          onSubmit={handleSubmit}
          submitLabel={props.submit}
          schema={props.schema ?? undefined}
          uischema={props.uischema ?? undefined}
          data={form}
          onChange={({ data, errors: _errors }) => {
            formSet(data);
            errorsSet(errors);
          }}
        />
      ) : (
        <Alert severity="info">There are no items to display.</Alert>
      )}
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
