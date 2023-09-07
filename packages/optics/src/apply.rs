use super::hkt::HKT1;

pub trait Apply<A>: HKT1 {
    fn apply<B>(self, second: Self::Kind1<impl Fn(A) -> B>) -> Self::Kind1<B>;
}

impl<A> Apply<A> for Option<A> {
    fn apply<B>(self, second: Self::Kind1<impl FnOnce(A) -> B>) -> Self::Kind1<B> {
        match (self, second) {
            (Some(a), Some(f)) => Some(f(a)),
            _ => None,
        }
    }
}

impl<E, A> Apply<A> for Result<A, E> {
    fn apply<B>(self, second: Self::Kind1<impl FnOnce(A) -> B>) -> Self::Kind1<B> {
        match (self, second) {
            (Ok(a), Ok(f)) => Ok(f(a)),
            (Err(error), _) => Err(error),
            (_, Err(error)) => Err(error),
        }
    }
}

impl<A> Apply<A> for Vec<A>
where
    A: Clone,
{
    fn apply<B>(self, second: Self::Kind1<impl Fn(A) -> B>) -> Self::Kind1<B> {
        let mut this = Vec::<B>::new();

        for a in self {
            for f in &second {
                this.push(f(a.clone()));
            }
        }

        this
    }
}
