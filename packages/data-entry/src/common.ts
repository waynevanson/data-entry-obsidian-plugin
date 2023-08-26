import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { readonlyRecord, string } from 'fp-ts';
import { Monoid } from 'fp-ts/lib/Monoid';
import { pipe } from 'fp-ts/lib/function';
import * as decoder from 'io-ts/Decoder';
import { Decoder } from 'io-ts/Decoder';

type GetSet<A> = Record<'get' | 'set', A>;

// remove the whole writing to a file thing, gross
// also allow loading icon to happen somewhere without removing the form.
export type Datasource = Sum<{
  file: {
    path: string;
    // frontmatter: GetSet<string>;
  };
  folder: string;
}>;

export interface Configuration {
  datasource: Datasource;
  schema: Sum<{ inline: JsonSchema }>; //register definitions behind "data-entry" or "vault" key
  uischema?: Sum<{ inline: UISchemaElement }>; // get set
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

/// schema
const datasource = sum({
  file: decoder.struct({
    path: decoder.string,
  }),
  folder: decoder.string,
});

export const configuration = pipe(
  decoder.struct({
    datasource,
    schema: decoder.struct({ inline: decoder.UnknownRecord }),
  }),
  decoder.intersect(
    decoder.partial({
      uischema: decoder.struct({ inline: decoder.UnknownRecord }),
    }),
  ),
);
