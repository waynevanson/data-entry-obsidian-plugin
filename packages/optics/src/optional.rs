use std::marker::PhantomData;

pub trait OptionalRef {
    type Source;
    type Target;

    fn get_optional_ref(&self, source: Self::Source) -> Option<Self::Target>;
    fn set_or_replace_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source;

    fn modify(
        &self,
        source: Self::Source,
        modify: impl Fn(Self::Target) -> Self::Target,
    ) -> Self::Source
    where
        Self::Source: Clone,
    {
        match self.get_optional_ref(source.clone()) {
            None => source,
            Some(target) => self.set_or_replace_ref(source, modify(target)),
        }
    }

    fn modify_only(
        &self,
        source: Self::Source,
        modify: impl Fn(Self::Target) -> Self::Target,
    ) -> Option<Self::Source>
    where
        Self::Source: Clone,
    {
        self.get_optional_ref(source.clone())
            .map(modify)
            .map(|target| self.set_or_replace_ref(source, target))
    }
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

    fn set_or_replace_ref(&self, _source: Self::Source, target: Self::Target) -> Self::Source {
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

    fn set_or_replace_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.optional
            .set_or_replace_ref(source, (self.contravariant)(target))
    }
}
