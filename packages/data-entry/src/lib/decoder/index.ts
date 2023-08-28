import { readonlyRecord, string } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import * as decoder from 'io-ts/Decoder';
import { Decoder } from 'io-ts/Decoder';

export * from 'io-ts/Decoder';

// todo - intersect decoder with one key only
export const sum = <P extends Record<string, Decoder<unknown, unknown>>>(
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
    readonlyRecord.reduce(string.Ord)(
      decoder.fromRefinement((i): i is never => false, 'Sum'),
      (b, a) =>
        pipe(
          b,
          decoder.alt(() => a as never),
        ),
    ),
  );

export const configurable = <A extends Record<string, unknown>>(
  properties: { [K in keyof A]: Decoder<unknown, A[K]> },
  defaults: { [K in keyof A]: A[K] },
): Decoder<unknown, A> =>
  pipe(
    properties,
    readonlyRecord.fromRecord,
    readonlyRecord.map(decoder.nullable),
    decoder.partial,
    decoder.map((partials) =>
      pipe(
        partials,
        readonlyRecord.filter((a): a is NonNullable<typeof a> => a != null),
      ),
    ),
    decoder.map((partials) => ({ ...defaults, ...partials })),
  );
