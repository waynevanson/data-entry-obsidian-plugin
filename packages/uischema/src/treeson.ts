/**
 * @summary
 * Just like a tree, but can distinguish between valid data types in JSON
 * recursively.
 */
import { either, option, readonlyNonEmptyArray } from 'fp-ts';
import { tailRec } from 'fp-ts/ChainRec';
import { Option } from 'fp-ts/Option';
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { pipe } from 'fp-ts/function';
import { Sum, match } from './sum';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TreeableArray<A> extends ReadonlyArray<Treeable<A>> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TreeableObject<A>
  extends ReadonlyRecord<string, Treeable<A>> {}

export type Treeable<A> = Sum<{
  array: TreeableArray<A>;
  object: TreeableObject<A>;
  primitive: A;
}>;

type NonPrimitive<A> = Exclude<Treeable<A>, Record<'primitive', A>>;

function isPrimitive<A>(fa: Treeable<A>): fa is Record<'primitive', A> {
  return 'primitive' in fa;
}

function isNonPrimitive<A>(fa: Treeable<A>): fa is NonPrimitive<A> {
  return !isPrimitive(fa);
}

export type Indice = Sum<{ array: number; object: string }>;
export type Index = ReadonlyArray<Indice>;

export function branch(index: Index) {
  return <A>(structure: Treeable<A>): Option<Treeable<A>> =>
    index.reduce(
      (inner, keyable) =>
        pipe(
          inner,
          option.chain((inner) => {
            if ('array' in keyable && 'array' in inner) {
              const array = inner.array;
              const index = keyable.array;
              return option.fromNullable(array[index]);
            } else if ('object' in keyable && 'object' in inner) {
              const object = inner.object;
              const index = keyable.object;
              return option.fromNullable(object[index]);
            } else if ('primitive' in inner) {
              return option.some(inner);
            } else {
              return option.none;
            }
          }),
        ),
      option.some(structure),
    );
}

export function leaf(index: Index) {
  return <A>(fa: Treeable<A>): Option<A> =>
    tailRec({ index, fa }, ({ index, fa }) =>
      pipe(
        fa,
        either.fromPredicate(isPrimitive, (a) => a as NonPrimitive<A>),
        either.map(({ primitive }) => option.some(primitive)),
        either.swap,
        either.bindTo('fa'),
        either.bindW('split', () =>
          pipe(
            index,
            readonlyNonEmptyArray.fromReadonlyArray,
            either.fromOption(() => option.none),
            either.map(readonlyNonEmptyArray.unappend),
          ),
        ),
        either.chainW(({ fa, split: [index, head] }) =>
          pipe(
            head,
            match({
              array: (index) =>
                pipe(
                  fa,
                  option.fromPredicate(
                    (fa): fa is Record<'array', TreeableArray<A>> =>
                      'array' in fa,
                  ),
                  option.chainNullableK(({ array }) => array[index]),
                ),
              object: (property) =>
                pipe(
                  fa,
                  option.fromPredicate(
                    (fa): fa is Record<'object', TreeableObject<A>> =>
                      'object' in fa,
                  ),
                  option.chainNullableK(({ object }) => object[property]),
                ),
            }),
            either.fromOption(() => option.none),
            either.map((fa) => ({ fa, index })),
          ),
        ),
        either.swap,
      ),
    );
}

export function of<A>(primitive: A): Treeable<A> {
  return { primitive };
}

export function mapWithIndex<A, B>(f: (index: Index, a: A) => B) {
  return (fa: Treeable<A>): Treeable<B> => {
    const currentIndex: Array<Indice> = [];

    function recursion(fa: Treeable<A>): Treeable<B> {
      return pipe(
        fa,
        match({
          array: (array) =>
            array.map((fa, index) => {
              currentIndex.push({ array: index });
              const fb = recursion(fa);
              currentIndex.pop();
              return { array: fb };
            }),
          object: (object) =>
            Object.entries(object)
              .map(([property, fa]) => {
                currentIndex.push({ object: property });
                const fb = recursion(fa);
                currentIndex.pop();
                return [property, fb];
              })
              .reduce(
                (
                  acc: Record<'object', TreeableObject<B>>,
                  [property, value],
                ) => {
                  //@ts-ignore
                  acc.object[property] = value;
                  return acc;
                },
                { object: {} },
              ),
          primitive: (a) => ({ primitive: f(currentIndex, a) }),
        }),
      ) as never;
    }

    return recursion(fa);
  };
}
