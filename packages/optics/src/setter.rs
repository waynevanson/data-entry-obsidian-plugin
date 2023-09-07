pub trait SetterRef {
    type Source;
    type Target;

    fn modify_ref<F>(
        &self,
        covariant: impl Fn(Self::Target) -> Self::Target,
        source: Self::Source,
    ) -> Self::Source;
}

pub trait SetterMut: SetterRef {
    fn modify_mut<F>(&mut self, covariant: F, source: Self::Source) -> Self::Source
    where
        F: Fn(Self::Target) -> Self::Target;
}

pub trait Setter: SetterMut {
    fn modify<F>(self, covariant: F, source: Self::Source) -> Self::Source
    where
        F: Fn(Self::Target) -> Self::Target;
}
