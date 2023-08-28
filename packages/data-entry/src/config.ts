import { pipe } from 'fp-ts/lib/function';
import { decoder } from './lib';

export const configuration = (
  defaults: Record<
    'datasource' | 'uischema' | 'schema',
    Record<'path' | 'frontmatter', string>
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
  // todo - allows relative paths
  decoder.map((string) => string.replace(/^\./, '')),
);

const file = (defaults: Record<'path' | 'frontmatter', string>) =>
  decoder.configurable({ path, frontmatter: decoder.string }, defaults);

export type ApplicationConfiguration = decoder.TypeOf<
  ReturnType<typeof configuration>
>;
