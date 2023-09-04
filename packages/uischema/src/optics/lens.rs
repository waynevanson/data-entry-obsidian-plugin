use std::marker::PhantomData;

pub trait LensRef {
    type Source;
    type Target;

    fn get_ref(&self, source: Self::Source) -> Self::Target;
    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait LensMut: LensRef {
    fn get_mut(&mut self, source: Self::Source) -> Self::Target;
    fn set_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source;
}

pub trait Lens: LensMut {
    fn get(self, source: Self::Source) -> Self::Target;
    fn set(&mut self, source: Self::Source, target: Self::Target) -> Self::Source;
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

impl<S> LensRef for LensId<S> {
    type Source = S;
    type Target = S;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        source
    }

    fn set_ref(&self, _source: Self::Source, target: Self::Target) -> Self::Source {
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

impl<L, F, G, A, B> LensRef for LensInvariantMap<L, F, G>
where
    L: LensRef<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    type Source = L::Source;
    type Target = B;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        (self.covariant)(self.lens.get_ref(source))
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.lens.set_ref(source, (self.contravariant)(target))
    }
}

impl<L, F, G, A, B> LensMut for LensInvariantMap<L, F, G>
where
    L: LensMut<Target = A>,
    F: Fn(A) -> B,
    G: Fn(B) -> A,
{
    fn get_mut(&mut self, source: Self::Source) -> Self::Target {
        (self.covariant)(self.lens.get_ref(source))
    }

    fn set_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        self.lens.set_ref(source, (self.contravariant)(target))
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

impl<I, V, A, B, C> LensRef for LensCompose<I, V>
where
    I: LensRef<Source = A, Target = B>,
    V: LensRef<Source = B, Target = C>,
    A: Clone,
{
    type Source = A;
    type Target = C;

    fn get_ref(&self, source: Self::Source) -> Self::Target {
        self.second.get_ref(self.first.get_ref(source))
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        let a = self.first.get_ref(source.clone());
        let a = self.second.set_ref(a, target);
        self.first.set_ref(source, a)
    }
}

impl<I, V, A, B, C> LensMut for LensCompose<I, V>
where
    I: LensMut<Source = A, Target = B>,
    V: LensMut<Source = B, Target = C>,
    A: Clone,
{
    fn get_mut(&mut self, source: Self::Source) -> Self::Target {
        self.second.get_mut(self.first.get_ref(source))
    }

    fn set_mut(&mut self, source: Self::Source, target: Self::Target) -> Self::Source {
        let a = self.first.get_mut(source.clone());
        let a = self.second.set_mut(a, target);
        self.first.set_mut(source, a)
    }
}
