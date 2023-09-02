// first thing I think of is JS values go in, js values come out
// a hashmap

use std::collections::HashMap;

use wasm_bindgen::JsValue;

use crate::{optics::Optional};

// #/**/*
pub struct Scope(String);

// so we send this map back to the client, how will the client like that?
pub struct OptionalsByScope(HashMap<Scope, Optional<JsValue, JsValue>>);

// need Schema to get the scopes
// Validate Schema against UISchema
// fn UISchema -> (Scope, Value) -> Data -> Data
// fn (UISchema -> Scopes) -> (Scope, Value) -> Data -> Data
