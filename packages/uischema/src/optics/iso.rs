pub mod traits {
    pub trait IsoRef {
        type Source;
        type Target;

        fn get_ref(&self, source: Self::Source) -> Self::Target;
    }

    pub trait IsoMut: IsoRef {
        fn get_mut(&mut self, source: Self::Source) -> Self::Target;
    }

    pub trait Iso: IsoMut {
        fn get(self, source: Self::Source) -> Self::Target;
    }
}

pub mod impls {
    use super::traits::{IsoMut, IsoRef};
    use std::marker::PhantomData;

    #[derive(Debug)]
    pub struct IsoId<S> {
        phantom: PhantomData<S>,
    }

    impl<S> IsoId<S> {
        pub fn new() -> Self {
            Self::default()
        }

        pub fn map<G, B>(self, closure: G) -> Map<Self, G>
        where
            G: Fn(S) -> B,
        {
            Map {
                iso: self,
                f: closure,
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
    }

    impl<S> IsoMut for IsoId<S> {
        fn get_mut(&mut self, source: Self::Source) -> Self::Target {
            self.get_ref(source)
        }
    }

    pub struct Map<I, F> {
        iso: I,
        f: F,
    }

    impl<I, F, A> Map<I, F>
    where
        I: IsoRef<Target = A>,
    {
        pub fn map<G, B>(self, closure: G) -> Map<Self, G>
        where
            G: Fn(A) -> B,
        {
            Map {
                iso: self,
                f: closure,
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

    impl<I, F, A, B> IsoRef for Map<I, F>
    where
        I: IsoRef<Target = A>,
        F: Fn(A) -> B,
    {
        type Source = I::Source;
        type Target = B;

        fn get_ref(&self, source: Self::Source) -> Self::Target {
            let a = self.iso.get_ref(source);
            (self.f)(a)
        }
    }

    impl<I, F, A, B> IsoMut for Map<I, F>
    where
        I: IsoRef<Target = A>,
        F: Fn(A) -> B,
    {
        fn get_mut(&mut self, source: Self::Source) -> Self::Target {
            let a = self.iso.get_ref(source);
            (self.f)(a)
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
        pub fn map<G, B>(self, closure: G) -> Map<Self, G>
        where
            G: Fn(A) -> B,
        {
            Map {
                iso: self,
                f: closure,
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
    }

    impl<I, V, A> IsoMut for IsoCompose<I, V>
    where
        I: IsoMut<Target = A>,
        V: IsoMut<Source = A>,
    {
        fn get_mut(&mut self, source: Self::Source) -> Self::Target {
            let a = self.first.get_ref(source);
            self.second.get_ref(a)
        }
    }
}
