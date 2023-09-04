pub trait PrismRef {
    type Source;
    type Target;

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target>;
}

pub trait PrismMut: PrismRef {
    fn get_option_mut(&mut self, source: Self::Source) -> Option<Self::Target>;
}

pub trait Prism: PrismMut {
    fn get_option(self, source: Self::Source) -> Option<Self::Target>;
}
