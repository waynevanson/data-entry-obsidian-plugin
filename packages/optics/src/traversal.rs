use std::marker::PhantomData;

use super::{applicative::Applicative, setter::SetterRef};

// why does thi sneed modifyF instead of just set?
pub trait TraversalRef: SetterRef {
    fn modify_applicative_ref<F, B>(
        kleisli: impl Fn(Self::Target) -> F::Kind1<B>,
        source: Self::Source,
    ) -> F::Kind1<B>
    where
        F: Applicative<Self::Target>;
}

pub struct TraversalSingle<S> {
    phantom: PhantomData<S>,
}

impl<S> SetterRef for TraversalSingle<S> {
    type Source = S;
    type Target = S;

    fn modify_ref<F>(
        &self,
        covariant: impl Fn(Self::Target) -> Self::Target,
        source: Self::Source,
    ) -> Self::Source {
        covariant(source)
    }
}

// impl<S> TraversalRef for TraversalSingle<S> {
//     fn modify_applicative_ref<F, B>(
//         kleisli: impl Fn(Self::Target) -> F::Kind1<B>,
//         source: Self::Source,
//     ) -> F::Kind1<B>
//     where
//         F: Applicative<Self::Target>,
//     {
//         kleisli(source)

//         FlatMap
//     }
// }

pub struct TraversalInvariantMap<F, G> {
    covariant: F,
    contravariant: G,
}
