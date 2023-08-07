// https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors
import { DefaultTheme } from 'styled-components';
import { readonlyRecord, readonlyArray } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

const variable = (string: string) => `var(${string})`;

type ColorBaseCount =
  | '00'
  | '05'
  | '10'
  | '20'
  | '25'
  | '30'
  | '35'
  | '40'
  | '50'
  | '60'
  | '70'
  | '100';

type ColorBase = Record<`hex${ColorBaseCount}`, string>;

const base = pipe(
  ['00', '05', '10', '20', '25', '30', '35', '40', '50', '60', '70', '100'],
  readonlyArray.map(
    (colorBaseCount) =>
      [
        `hex${colorBaseCount}`,
        variable(`--color-base-${colorBaseCount}}`),
      ] as const,
  ),
  readonlyRecord.fromEntries,
) as ColorBase;

export type ColorAccent = Record<'hue' | 'saturation' | 'lightness', string>;

const accent = pipe(
  ['hue', 'saturation', 'lightness'],
  readonlyArray.map((name) => [name, variable(`--accent-${name[0]}`)] as const),
  readonlyRecord.fromEntries,
) as ColorAccent;

export type ColorMono = Record<'min' | 'max', string>;

const mono: ColorMono = {
  max: variable(`--mono-rgb-100`),
  min: variable(`--mono-rgb-0`),
};

export type ColorExtended = Record<
  'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink',
  Record<'rgb' | 'hex', string>
>;

const extended = pipe(
  ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'],
  readonlyArray.map(
    (color) =>
      [
        color,
        {
          rgb: variable(`--color-${color}-rgb`),
          hex: variable(`--color-${color}`),
        },
      ] as const,
  ),
  readonlyRecord.fromEntries,
) as ColorExtended;

const primsec = pipe(
  ['primary', 'seconday'],
  readonlyArray.map((upper) => [upper, { min: ``, max: `-alt` }] as const),
  readonlyRecord.fromEntries,
  readonlyRecord.mapWithIndex((name, bound) =>
    pipe(
      bound,
      readonlyRecord.map((end) => variable(`--background-${name}${end}`)),
    ),
  ),
);

const deepModifiers = pipe(
  {
    hover: { normal: 'hover', active: 'active-hover' },
    border: {
      normal: 'border',
      focus: 'border-focus',
      hover: 'border-hover',
    },
    error: {
      rgb: 'error-rgb',
      hex: 'error',
      hover: 'error-hover',
    },
    success: {
      rgb: 'success-rgb',
      hex: 'success',
    },
  },
  readonlyRecord.map(
    readonlyRecord.map((suffix) => variable(`--background-modifier-${suffix}`)),
  ),
);
export function makeTheme(): DefaultTheme {
  return {
    color: {
      base,
      accent,
      mono,
      extended,
      semantic: {
        background: {
          modifier: {
            ...deepModifiers,
            message: variable(`--background-modifers-message`),
            formField: variable(`--background-modifers-form-field`),
          },
          ...primsec,
        } as never,
        text: {
          foreground: pipe(
            {
              normal: '',
              muted: '',
              faint: 'faint',
              onAccent: 'on-accent',
              onAccentInverted: 'on-accent-inverted',
              error: 'error',
              success: 'success',
              accent: 'accent',
              accentHover: 'accent-hover',
            },
            readonlyRecord.map((name) => variable(`--text-${name}`)),
          ),
          background: pipe(
            {
              highlight: '--text-highlight-bg',
              selection: '--text-selection',
            },
            readonlyRecord.map(variable),
          ),
        },
      },
    },
  };
}

export const theme = makeTheme();

declare module 'styled-components' {
  export interface DefaultTheme {
    color: {
      base: ColorBase;
      accent: ColorAccent;
      extended: ColorExtended;
      mono: ColorMono;
      semantic: {
        background: {
          modifier: {
            hover: Record<'active' | 'normal', string>;
            border: Record<'normal' | 'focus' | 'hover', string>;
            error: Record<'rgb' | 'hex' | 'hover', string>;
            success: Record<'rgb' | 'hex', string>;
          } & Record<'message' | 'formField', string>;
        } & Record<'primary' | 'secondary', Record<'above' | 'below', string>>;
        text: {
          background: Record<'selection' | 'highlight', string>;
          foreground: Record<
            | 'normal'
            | 'muted'
            | 'faint'
            | 'onAccent'
            | 'onAccentInverted'
            | 'error'
            | 'success'
            | 'accent'
            | 'accentHover',
            string
          >;
        };
      };
    };
  }
}
