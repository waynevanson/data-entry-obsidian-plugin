// first thing I think of is JS values go in, js values come out
// a hashmap



use std::collections::HashMap;

// #/**/*

// so we send this map back to the client, how will the client like that?
// send traversal fns
pub struct OptionalsByScope(HashMap<String, ()>);

enum Step {
    Object(String),
    Array,
}
