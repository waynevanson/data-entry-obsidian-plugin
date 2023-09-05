use std::marker::PhantomData;

pub trait OptionalRef {
    type Source;
    type Target;

    fn get_optional_ref(&self, source: Self::Source) -> Option<Self::Target>;
    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait OptionalMut: OptionalRef {
    fn get_optional_mut(&mut self, source: Self::Source) -> Option<Self::Target>;
    fn set_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait Optional: OptionalMut {
    fn get_optional(&self, source: Self::Source) -> Option<Self::Target>;
    fn set_mut(self, target: Self::Target) -> Self::Source;
}

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

impl<S> OptionalRef for OptionalId<S> {
    type Source = S;
    type Target = S;

    fn get_optional_ref(&self, source: Self::Source) -> Option<Self::Target> {
        Some(source)
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        target
    }
}

impl<S> OptionalMut for OptionalId<S> {
    fn get_optional_mut(&mut self, source: Self::Source) -> Option<Self::Target> {
        Some(source)
    }

    fn set_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        target
    }
}

struct OptionalInvariantMap<O, F, G> {
    optional: O,
    covariant: F,
    contravariant: G,
}

impl<O, F, G, S, A, B> OptionalRef for OptionalInvariantMap<O, F, G>
where
    O: OptionalRef<Source = S, Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    type Source = S;
    type Target = B;

    fn get_optional_ref(&self, source: Self::Source) -> Option<Self::Target> {
        // Option::map is FnOnce, not Fn
        #[allow(clippy::manual_map)]
        match self.optional.get_optional_ref(source) {
            Some(a) => Some((self.covariant)(a)),
            None => None,
        }
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.optional.set_ref(source, (self.contravariant)(target))
    }
}

impl<O, F, G, S, A, B> OptionalMut for OptionalInvariantMap<O, F, G>
where
    O: OptionalMut<Source = S, Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    fn get_optional_mut(&mut self, source: Self::Source) -> Option<Self::Target> {
        // Option::map is FnOnce, not Fn
        #[allow(clippy::manual_map)]
        match self.optional.get_optional_ref(source) {
            Some(a) => Some((self.covariant)(a)),
            None => None,
        }
    }

    fn set_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.optional.set_mut(source, (self.contravariant)(target))
    }
}
