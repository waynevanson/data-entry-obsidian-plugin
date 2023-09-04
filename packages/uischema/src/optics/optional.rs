use std::marker::PhantomData;

pub trait OptionalRef {}

pub trait OptionalMut: OptionalRef {}

pub trait Optional: OptionalMut {}

pub struct OptionalId<S> {
    phantom: PhantomData<S>,
}

impl<S> Default for OptionalId<S> {
    fn default() -> Self {
        Self {
            phantom: PhantomData,
        }
    }
}
