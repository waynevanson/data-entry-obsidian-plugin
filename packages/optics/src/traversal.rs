use std::marker::PhantomData;

use super::setter::SetterRef;

// why does thi sneed modifyF instead of just set?
pub trait TraversalRef: SetterRef {
    type Output<A>;

    fn modify_applicative_ref<B>(
        &self,
        modify: impl Fn(Self::Target) -> B,
        source: Self::Source,
    ) -> Self::Output<B>;
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

impl<S> TraversalRef for TraversalSingle<S> {
    type Output<A> = A;

    fn modify_applicative_ref<B>(
        &self,
        modify: impl Fn(Self::Target) -> B,
        source: Self::Source,
    ) -> Self::Output<B> {
        modify(source)
    }
}

pub struct TraversalInvariantMap<T, F, G> {
    traversal: T,
    covariant: F,
    contravariant: G,
}

impl<T, Z, Y, B> SetterRef for TraversalInvariantMap<T, Z, Y>
where
    T: SetterRef,
    Z: Fn(T::Target) -> B,
    Y: Fn(B) -> T::Target,
{
    type Source = T::Source;
    type Target = B;

    fn modify_ref<F>(
        &self,
        covariant: impl Fn(Self::Target) -> Self::Target,
        source: Self::Source,
    ) -> Self::Source {
        self.traversal.modify_ref::<F>(
            |t_target| (self.contravariant)(covariant((self.covariant)(t_target))),
            source,
        )
    }
}

impl<T, Z, Y> TraversalRef for TraversalInvariantMap<T, Z, Y>
where
    T: TraversalRef,
    Z: Fn(T::Target) -> Self::Target,
    Y: Fn(Self::Target) -> T::Target,
    Self: SetterRef<Source = T::Source>,
{
    type Output<A> = T::Output<A>;

    fn modify_applicative_ref<B>(
        &self,
        modify: impl Fn(Self::Target) -> B,
        source: Self::Source,
    ) -> Self::Output<B> {
        self.traversal
            .modify_applicative_ref(|t_target| modify((self.covariant)(t_target)), source)
    }
}
