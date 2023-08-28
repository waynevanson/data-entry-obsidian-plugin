import { option, readonlyRecord, string } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { decoder } from './lib';
import { Decoder } from 'io-ts/Decoder';
import { Sum } from './lib/sum';

export type Datasource = Sum<{
  file: {
    path: string;
    frontmatter: string; // defaults to 'data'
  };
}>;

export const configuration = (
  defaults: Record<
    'datasource' | 'uischema' | 'schema',
    Record<'path', string>
  >,
) =>
  pipe(
    decoder.struct({
      datasource: decoder.sum({ file: file(defaults.datasource) }),
      schema: decoder.sum({
        inline: decoder.UnknownRecord,
        file: file(defaults.schema),
      }),
    }),
    decoder.intersect(
      decoder.partial({
        uischema: decoder.sum({
          inline: decoder.UnknownRecord,
          file: file(defaults.datasource),
        }),
      }),
    ),
  );

const path = pipe(
  decoder.string,
  // allows relative paths
  decoder.map((string) => string.replace(/^\./, '')),
);

const file = (defaults: Record<'path', string>) =>
  pipe(
    decoder.struct({
      frontmatter: decoder.string,
    }),
    decoder.intersect(decoder.configurable({ path }, defaults)),
  );

export type ApplicationConfiguration = decoder.TypeOf<
  ReturnType<typeof configuration>
>;
