pub trait FoldRef {
    type Source;
    type Target;

    fn fold_map_ref<F, M>(&self, covariant: F) -> M
    where
        F: Fn(Self::Target) -> M;
}

pub trait FoldMut: FoldRef {
    fn fold_map_mut<F, M>(&mut self, covariant: F) -> M
    where
        F: Fn(Self::Target) -> M;
}

pub trait Fold: FoldMut {
    fn fold_map<F, M>(self, covariant: F) -> M
    where
        F: Fn(Self::Target) -> M;
}
