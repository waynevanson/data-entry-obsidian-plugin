use std::{iter::FromIterator, marker::PhantomData};

pub trait TraversalRef {
    type Source;
    type Target;
    type Container;

    fn get_all_ref(&self, source: Self::Source) -> Self::Container;
    fn set_all_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait TraversalMut: TraversalRef {
    fn get_all_mut(&mut self, source: Self::Source) -> Self::Container;
    fn set_all_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait Traversal: TraversalMut {
    fn get_all(self, source: Self::Source) -> Self::Container;
    fn set_all(self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub struct TraversalId<I> {
    phantom: PhantomData<I>,
}

impl<I> TraversalRef for TraversalId<I>
where
    I: FromIterator<I::Item> + IntoIterator,
    I::Item: Clone,
{
    type Source = I;
    type Target = I::Item;
    type Container = I;

    fn get_all_ref(&self, source: Self::Source) -> Self::Container {
        source
    }

    fn set_all_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        source.into_iter().map(|_| target.clone()).collect()
    }
}

impl<I> TraversalMut for TraversalId<I>
where
    I: FromIterator<I::Item> + IntoIterator,
    I::Item: Clone,
{
    fn get_all_mut(&mut self, source: Self::Source) -> Self::Container {
        source
    }

    fn set_all_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        source.into_iter().map(|_| target.clone()).collect()
    }
}

impl<I> Traversal for TraversalId<I>
where
    I: FromIterator<I::Item> + IntoIterator,
    I::Item: Clone,
{
    fn get_all(self, source: Self::Source) -> Self::Container {
        source
    }

    fn set_all(self, source: Self::Source, target: Self::Target) -> Self::Source {
        source.into_iter().map(|_| target.clone()).collect()
    }
}

pub struct TraversalInvariantMap<T, F, G> {
    traversal: T,
    covariant: F,
    contravariant: G,
}

impl<T, F, G, B> TraversalRef for TraversalInvariantMap<T, F, G>
where
    T: TraversalRef,
    T::Container: IntoIterator<Item = T::Target> + FromIterator<B>,
    T::Target: Clone,
    F: Fn(T::Target) -> B,
    G: Fn(B) -> T::Target,
{
    type Source = T::Source;
    type Target = B;
    type Container = T::Container;

    fn get_all_ref(&self, source: Self::Source) -> Self::Container {
        self.traversal
            .get_all_ref(source)
            .into_iter()
            .map(|target| (self.covariant)(target))
            .collect()
    }

    fn set_all_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.traversal
            .set_all_ref(source, (self.contravariant)(target))
    }
}
