import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { readonlyRecord, string } from 'fp-ts';
import { Monoid } from 'fp-ts/lib/Monoid';
import { pipe } from 'fp-ts/lib/function';
import * as decoder from 'io-ts/Decoder';
import { Decoder } from 'io-ts/Decoder';

// remove the whole writing to a file thing, gross
// also allow loading icon to happen somewhere without removing the form.
export type Datasource = Sum<{
  file: {
    path: string;
    frontmatter: string; // defaults to 'data'
  };
}>;

export interface Configuration {
  datasource: Datasource;
  // todo - register definitions behind "data-entry" or "vault" key
  schema: Sum<{
    inline: JsonSchema;
    file: {
      path: string;
      frontmatter: string;
    }; // defaults to 'schema'
  }>;
  uischema?: Sum<{
    inline: UISchemaElement;
    file: {
      path: string;
      frontmatter: string;
    }; // defaults to 'uischema'
  }>;
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

// todo - intersect decoder with one key only
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

const file = decoder.struct({
  path: decoder.string,
  frontmatter: decoder.string,
});
/// schema
const datasource = sum({ file });

export const configuration = pipe(
  decoder.struct({
    datasource,
    schema: sum({
      inline: decoder.UnknownRecord,
      file,
    }),
  }),
  decoder.intersect(
    decoder.partial({
      uischema: sum({
        inline: decoder.UnknownRecord,
        file,
      }),
    }),
  ),
);
