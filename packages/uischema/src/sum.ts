import { pipe } from 'fp-ts/lib/function';

export type Sum<T extends Record<string, unknown>> = keyof T extends never
  ? never
  : {
      [P in keyof T]: Record<P, T[P]>;
    }[keyof T];

export function match<
  T extends Record<string, unknown>,
  CS extends T extends unknown
    ? {
        [P in keyof T]: (argument: T[P]) => unknown;
      }
    : never,
>(cases: CS) {
  return (sum: T): ReturnType<CS[keyof CS]> => {
    const name = Object.keys(sum)[0] as keyof T;
    const value = sum[name];
    const fn = cases[name as keyof CS];
    return fn(value) as never;
  };
}
