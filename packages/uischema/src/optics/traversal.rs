use std::iter::FromIterator;

pub trait TraversalRef {
    type Source;
    type Target;
    type Container: FromIterator<Self::Target> + IntoIterator<Item = Self::Target>;

    fn get_all_ref(&self, source: Self::Source) -> Self::Container;
    fn set_all_ref(&self, source: Self::Source, target: Self::Target) -> Self::Container;
}

pub trait TraversalMut: TraversalRef {
    fn get_all_mut(&self, source: Self::Source) -> Self::Container;
    fn set_all_mut(&self, source: Self::Source, target: Self::Target) -> Self::Container;
}

pub trait Traversal: TraversalMut {
    fn get_all(&self, source: Self::Source) -> Self::Container;
    fn set_all(&self, source: Self::Source, target: Self::Target) -> Self::Container;
}
