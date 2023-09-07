use super::apply::Apply;

pub trait Applicative<A>: Apply<A> {
    fn pure(value: A) -> Self::Kind1<A>;
}
