export class Traversal<S, A> {
  constructor(expression: string);

  get_option(source: S): A;

  modify_option(source: S, kleisli: (target: A) => A | undefined): S;

  modify(source: S, endomorphism: (target: A) => A): S;

  set(source: S, target: A): S;
}
