pub type Get<S, A> = Box<dyn Fn(S) -> A>;
pub type Apply<S, A> = Box<dyn Fn(A) -> S>;
pub type Set<S, A> = Box<dyn Fn(S, A) -> S>;
pub type GetOption<S, A> = Box<dyn Fn(S) -> Option<A>>;

pub struct Iso<S, A> {
    get: Get<S, A>,
    apply: Apply<S, A>,
}

impl<S> Iso<S, S> {
    pub fn id() -> Self {
        Self {
            get: Box::new(|s| s),
            apply: Box::new(|s| s),
        }
    }
}

impl<S, A> Iso<S, A>
where
    S: 'static,
    A: 'static,
{
    pub fn map_invariant<B>(
        self,
        covariant: impl Fn(A) -> B + 'static,
        contravariant: impl Fn(B) -> A + 'static,
    ) -> Iso<S, B> {
        let Self { get, apply } = self;
        Iso {
            get: Box::new(move |s| covariant(get(s))),
            apply: Box::new(move |b| apply(contravariant(b))),
        }
    }

    pub fn lens(self) -> Lens<S, A> {
        let Self { get, apply } = self;
        Lens {
            get,
            set: Box::new(move |_s, a| apply(a)),
        }
    }
}

pub struct Lens<S, A> {
    get: Get<S, A>,
    set: Set<S, A>,
}

impl<S: 'static> Lens<S, S> {
    pub fn id() -> Self {
        Self {
            get: Box::new(|s| s),
            set: Box::new(|_s, a| a),
        }
    }
}

impl<S, A> Lens<S, A>
where
    S: 'static,
    A: 'static,
{
    pub fn map_invariant<B>(
        self,
        covariant: impl Fn(A) -> B + 'static,
        contravariant: impl Fn(B) -> A + 'static,
    ) -> Lens<S, B> {
        let Self { get, set } = self;
        Lens {
            get: Box::new(move |s| covariant(get(s))),
            set: Box::new(move |s, b| set(s, contravariant(b))),
        }
    }

    pub fn prism(self) -> Prism<S, A> {
        let Self { get, set } = self;
        Prism {
            get_option: Box::new(move |s| Some(get(s))),
            set,
        }
    }
}

pub struct Prism<S, A> {
    get_option: GetOption<S, A>,
    set: Set<S, A>,
}

impl<S: 'static> Prism<S, S> {
    pub fn id() -> Self {
        Self {
            get_option: Box::new(|s| Some(s)),
            set: Box::new(|_s, a| a),
        }
    }
}

impl<S, A> Prism<S, A>
where
    S: 'static,
    A: 'static,
{
    pub fn map_invariant<B>(
        self,
        covariant: impl Fn(A) -> B + 'static,
        contravariant: impl Fn(B) -> A + 'static,
    ) -> Prism<S, B> {
        let Self { get_option, set } = self;
        Prism {
            get_option: Box::new(move |s| get_option(s).map(&covariant)),
            set: Box::new(move |s, b| set(s, contravariant(b))),
        }
    }

    pub fn optional(self) -> Optional<S, A> {
        let Self { get_option, set } = self;
        Optional {
            get_option,
            replace: set,
        }
    }
}

pub struct Optional<S, A> {
    get_option: GetOption<S, A>,
    replace: Set<S, A>,
}

impl<S: 'static> Optional<S, S> {
    pub fn id() -> Self {
        Self {
            get_option: Box::new(|s| Some(s)),
            replace: Box::new(|_s, a| a),
        }
    }
}

impl<S, A> Optional<S, A>
where
    S: 'static,
    A: 'static,
{
    pub fn map_invariant<B>(
        self,
        covariant: impl Fn(A) -> B + 'static,
        contravariant: impl Fn(B) -> A + 'static,
    ) -> Optional<S, B> {
        let Self {
            get_option,
            replace,
        } = self;
        Optional {
            get_option: Box::new(move |s| get_option(s).map(&covariant)),
            replace: Box::new(move |s, b| replace(s, contravariant(b))),
        }
    }
}

pub trait Traversal<S, A> {
    type Traversable: Iterator<Item = A>;

    fn get_all(s: S) -> Self::Traversable;
    fn modify_all<F>(f: F) -> fn(S) -> S
    where
        F: Fn(A) -> A;
}
