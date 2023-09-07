/// An `IsoRef` is an optic which converts elements of type `Source` into elements of type `Target` without loss,
/// where the `IsoRef` is a reference.
pub trait IsoRef {
    type Source;
    type Target;

    fn get_ref(&self, source: Self::Source) -> Self::Target;
    fn apply_ref(&self, target: Self::Target) -> Self::Source;
}

/// An `Iso` is an optic which converts elements of type `Source` into elements of type `Target` without loss.
pub trait IsoMut: IsoRef {
    fn get_mut(&mut self, source: Self::Source) -> Self::Target;
    fn apply_mut(&mut self, target: Self::Target) -> Self::Source;
}

/// An `Iso` is an optic which converts elements of type `Source` into elements of type `Target` without loss.
pub trait Iso: IsoMut {
    fn get(self, source: Self::Source) -> Self::Target;
    fn apply(self, target: Self::Target) -> Self::Source;
}

use std::marker::PhantomData;

#[derive(Debug)]
pub struct IsoId<S> {
    phantom: PhantomData<S>,
}

impl<S> IsoId<S> {
    pub fn imap<G, H, B>(self, covariant: G, contravariant: H) -> IsoInvariantMap<Self, G, H>
    where
        G: Fn(S) -> B,
        H: Fn(B) -> S,
    {
        IsoInvariantMap {
            iso: self,
            covariant,
            contravariant,
        }
    }

    pub fn compose<V>(self, second: V) -> IsoCompose<Self, V>
    where
        V: IsoRef<Source = S>,
    {
        IsoCompose {
            first: self,
            second,
        }
    }
}

impl<S> Default for IsoId<S> {
    fn default() -> Self {
        Self {
            phantom: PhantomData,
        }
    }
}

impl<S> IsoRef for IsoId<S> {
    type Source = S;
    type Target = S;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        source
    }

    fn apply_ref(&self, target: Self::Target) -> Self::Source {
        target
    }
}

impl<S> IsoMut for IsoId<S> {
    fn get_mut(&mut self, source: Self::Source) -> Self::Target {
        self.get_ref(source)
    }

    fn apply_mut(&mut self, target: Self::Target) -> Self::Source {
        self.apply_ref(target)
    }
}

pub struct IsoInvariantMap<I, F, G> {
    iso: I,
    covariant: F,
    contravariant: G,
}

impl<I, F, G, A> IsoInvariantMap<I, F, G>
where
    I: IsoRef<Target = A>,
{
    pub fn imap<H, J, B>(self, covariant: H, contravariant: J) -> IsoInvariantMap<Self, H, J>
    where
        H: Fn(A) -> B,
        J: Fn(B) -> A,
    {
        IsoInvariantMap {
            iso: self,
            covariant,
            contravariant,
        }
    }

    pub fn compose<V>(self, second: V) -> IsoCompose<Self, V>
    where
        V: IsoRef<Source = A>,
    {
        IsoCompose {
            first: self,
            second,
        }
    }
}

impl<I, F, G, A, B> IsoRef for IsoInvariantMap<I, F, G>
where
    I: IsoRef<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    type Source = I::Source;
    type Target = B;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        (self.covariant)(self.iso.get_ref(source))
    }

    fn apply_ref(&self, target: Self::Target) -> Self::Source {
        self.iso.apply_ref((self.contravariant)(target))
    }
}

impl<I, F, G, A, B> IsoMut for IsoInvariantMap<I, F, G>
where
    I: IsoRef<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    fn get_mut(&mut self, source: Self::Source) -> Self::Target {
        (self.covariant)(self.iso.get_ref(source))
    }

    fn apply_mut(&mut self, target: Self::Target) -> Self::Source {
        self.iso.apply_ref((self.contravariant)(target))
    }
}

pub struct IsoCompose<I, V> {
    first: I,
    second: V,
}

impl<I, V, A> IsoCompose<I, V>
where
    I: IsoRef<Target = A>,
{
    pub fn imap<G, H, B>(self, closure: G, contravariant: H) -> IsoInvariantMap<Self, G, H>
    where
        G: Fn(A) -> B,
        H: Fn(B) -> A,
    {
        IsoInvariantMap {
            iso: self,
            covariant: closure,
            contravariant,
        }
    }
}

impl<I, V> IsoCompose<I, V>
where
    V: IsoRef,
{
    pub fn compose<W>(self, second: W) -> IsoCompose<Self, W>
    where
        W: IsoRef<Source = V::Target>,
    {
        IsoCompose {
            first: self,
            second,
        }
    }
}

impl<I, V, A> IsoRef for IsoCompose<I, V>
where
    I: IsoRef<Target = A>,
    V: IsoRef<Source = A>,
{
    type Source = I::Source;
    type Target = V::Target;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        let a = self.first.get_ref(source);
        self.second.get_ref(a)
    }

    fn apply_ref(&self, target: Self::Target) -> Self::Source {
        self.first.apply_ref(self.second.apply_ref(target))
    }
}

impl<I, V, A> IsoMut for IsoCompose<I, V>
where
    I: IsoMut<Target = A>,
    V: IsoMut<Source = A>,
{
    fn get_mut(&mut self, source: Self::Source) -> Self::Target {
        self.second.get_ref(self.first.get_ref(source))
    }

    fn apply_mut(&mut self, target: Self::Target) -> Self::Source {
        self.first.apply_mut(self.second.apply_mut(target))
    }
}
