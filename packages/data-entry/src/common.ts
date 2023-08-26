import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { readonlyRecord, string } from 'fp-ts';
import { Monoid } from 'fp-ts/lib/Monoid';
import { pipe } from 'fp-ts/lib/function';
import * as decoder from 'io-ts/Decoder';
import { Decoder } from 'io-ts/Decoder';

export type Datasource = Sum<{
  file: string;
  folder: string;
}>;

export interface Configuration {
  datasource: Datasource;
  forms: {
    schema: JsonSchema;
    uischema?: UISchemaElement;
  };
}

export type Sum<T extends Record<string, unknown>> = keyof T extends never
  ? never
  : {
      [P in keyof T]: Record<P, T[P]>;
    }[keyof T];

const decoderMonoid = <I, A>(error: string): Monoid<Decoder<I, A>> => ({
  empty: decoder.fromRefinement((i): i is never => false, error),
  concat: (x, y) => decoder.Alt.alt(x, () => y),
});

const decoderSumMonoid = <P>() =>
  decoderMonoid<
    { [K in keyof P]: Record<K, decoder.InputOf<P[K]>> }[keyof P],
    { [K in keyof P]: Record<K, decoder.TypeOf<P[K]>> }[keyof P]
  >('Sum');

// fix this then all good right?
const sum = <P extends Record<string, Decoder<unknown, unknown>>>(
  properties: keyof P extends never ? never : P,
): Decoder<
  { [K in keyof P]: Record<K, decoder.InputOf<P[K]>> }[keyof P],
  { [K in keyof P]: Record<K, decoder.TypeOf<P[K]>> }[keyof P]
> =>
  pipe(
    properties,
    readonlyRecord.fromRecord,
    readonlyRecord.mapWithIndex((property, value) =>
      decoder.struct({ [property]: value }),
    ),
    readonlyRecord.foldMap(string.Ord)(decoderSumMonoid<P>())(
      (de) => de as never,
    ),
  );

/// schema
const datasource = sum({ file: decoder.string, folder: decoder.string });

export const configuration = decoder.struct({
  datasource,
  forms: pipe(
    decoder.struct({ schema: decoder.UnknownRecord }),
    decoder.intersect(decoder.partial({ uischema: decoder.UnknownRecord })),
  ),
});
