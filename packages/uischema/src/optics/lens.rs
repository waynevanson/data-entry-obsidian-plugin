use std::marker::PhantomData;

use super::iso::{Iso, IsoMut, IsoRef};

pub trait LensRef: IsoRef {
    fn replace_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait LensMut: IsoMut {
    fn replace_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait Lens: Iso {
    fn replace(&mut self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub struct LensId<S> {
    phantom: PhantomData<S>,
}

impl<S> Default for LensId<S> {
    fn default() -> Self {
        Self {
            phantom: PhantomData,
        }
    }
}

impl<S> LensId<S> {
    pub fn imap<G, H, B>(self, covariant: G, contravariant: H) -> LensInvariantMap<Self, G, H>
    where
        G: Fn(S) -> B,
        H: Fn(B) -> S,
    {
        LensInvariantMap {
            lens: self,
            covariant,
            contravariant,
        }
    }
}

impl<S> IsoRef for LensId<S> {
    type Source = S;
    type Target = S;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        source
    }

    fn apply_ref(&self, target: Self::Target) -> Self::Source {
        target
    }
}

impl<S> LensRef for LensId<S> {
    fn replace_ref(&self, _source: Self::Source, target: Self::Target) -> Self::Source {
        target
    }
}

pub struct LensInvariantMap<L, F, G> {
    lens: L,
    covariant: F,
    contravariant: G,
}

impl<I, F, G, A> LensInvariantMap<I, F, G>
where
    I: LensRef<Target = A>,
{
    pub fn imap<H, J, B>(self, covariant: H, contravariant: J) -> LensInvariantMap<Self, H, J>
    where
        H: Fn(A) -> B,
        J: Fn(B) -> A,
    {
        LensInvariantMap {
            lens: self,
            covariant,
            contravariant,
        }
    }
}

impl<L, F, G, A, B> IsoRef for LensInvariantMap<L, F, G>
where
    L: IsoRef<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    type Source = L::Source;
    type Target = B;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        (self.covariant)(self.lens.get_ref(source))
    }

    fn apply_ref(&self, target: Self::Target) -> Self::Source {
        self.lens.apply_ref((self.contravariant)(target))
    }
}

impl<L, F, G, A, B> LensRef for LensInvariantMap<L, F, G>
where
    L: LensRef<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    fn replace_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.lens.replace_ref(source, (self.contravariant)(target))
    }
}

impl<L, F, G, A, B> IsoMut for LensInvariantMap<L, F, G>
where
    L: IsoMut<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    fn get_mut(&mut self, source: Self::Source) -> Self::Target {
        (self.covariant)(self.lens.get_mut(source))
    }

    fn apply_mut(&mut self, target: Self::Target) -> Self::Source {
        self.lens.apply_ref((self.contravariant)(target))
    }
}

impl<L, F, G, A, B> LensMut for LensInvariantMap<L, F, G>
where
    L: LensMut<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    fn replace_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.lens.replace_mut(source, (self.contravariant)(target))
    }
}

pub struct LensCompose<I, V> {
    first: I,
    second: V,
}

impl<I, V, A> LensCompose<I, V>
where
    I: LensRef<Target = A>,
{
    pub fn imap<G, H, B>(self, closure: G, contravariant: H) -> LensInvariantMap<Self, G, H>
    where
        G: Fn(A) -> B,
        H: Fn(B) -> A,
    {
        LensInvariantMap {
            lens: self,
            covariant: closure,
            contravariant,
        }
    }
}

impl<I, V> LensCompose<I, V>
where
    V: LensRef,
{
    pub fn compose<W>(self, second: W) -> LensCompose<Self, W>
    where
        W: LensRef<Source = V::Target>,
    {
        LensCompose {
            first: self,
            second,
        }
    }
}

impl<I, V, A> IsoRef for LensCompose<I, V>
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

impl<I, V, A> LensRef for LensCompose<I, V>
where
    I: LensRef<Target = A>,
    V: LensRef<Source = A>,
    Self::Source: Clone,
{
    fn replace_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        let a = self.first.get_ref(source.clone());
        let a = self.second.replace_ref(a, target);
        self.first.replace_ref(source, a)
    }
}

impl<I, V, A> IsoMut for LensCompose<I, V>
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

impl<I, V, A> LensMut for LensCompose<I, V>
where
    I: LensMut<Target = A>,
    V: LensMut<Source = A>,
    Self::Source: Clone,
{
    fn replace_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        let a = self.first.get_mut(source.clone());
        let a = self.second.replace_mut(a, target);
        self.first.replace_mut(source, a)
    }
}
