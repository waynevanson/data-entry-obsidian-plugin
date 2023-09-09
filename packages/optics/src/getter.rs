pub trait GetterRef {
    type Source;
    type Target;

    fn get_ref(&self, source: Self::Source) -> Self::Target;
}

pub trait GetterMut: GetterRef {
    fn get_mut(&mut self, source: Self::Source) -> Self::Target;
}

pub trait Getter: GetterMut {
    fn get(self, source: Self::Source) -> Self::Target;
}
