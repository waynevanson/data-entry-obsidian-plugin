use super::fold::{Fold, FoldMut, FoldRef};

pub trait GetterRef: FoldRef {
    fn get_ref(&self, source: Self::Source) -> Self::Target;
}

pub trait GetterMut: GetterRef + FoldMut {
    fn get_mut(&mut self, source: Self::Source) -> Self::Target;
}

pub trait Getter: GetterMut + Fold {
    fn get(self, source: Self::Source) -> Self::Target;
}
