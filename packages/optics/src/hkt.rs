use std::collections::HashMap;

pub trait HKT1 {
    type Kind1<A>;
}

pub trait HKT2 {
    type Kind2<A, B>;
}

impl<T> HKT1 for Option<T> {
    type Kind1<A> = Option<A>;
}

impl<T, E> HKT1 for Result<T, E> {
    type Kind1<A> = Result<A, E>;
}

impl<T> HKT1 for Vec<T> {
    type Kind1<A> = Vec<A>;
}

impl<T, U> HKT1 for HashMap<T, U> {
    type Kind1<A> = HashMap<T, A>;
}

impl<T, U> HKT2 for HashMap<T, U> {
    type Kind2<A, B> = HashMap<A, B>;
}
