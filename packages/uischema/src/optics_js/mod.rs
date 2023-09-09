use optics::*;
use serde_json::{Map, Number, Value as JsonValue};

pub struct JsonNull;

impl PrismRef for JsonNull {
    type Source = JsonValue;
    type Target = ();

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target> {
        source.as_null()
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        JsonValue::Null
    }
}

pub struct JsonBoolean;

impl PrismRef for JsonBoolean {
    type Source = JsonValue;
    type Target = bool;

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target> {
        source.as_bool()
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        JsonValue::Bool(target)
    }
}

struct JsonNumber;

impl PrismRef for JsonNumber {
    type Source = JsonValue;
    type Target = Number;

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target> {
        match source {
            JsonValue::Number(number) => Some(number),
            _ => None,
        }
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        JsonValue::Number(target)
    }
}

pub struct JsonString;

impl PrismRef for JsonString {
    type Source = JsonValue;
    type Target = String;

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target> {
        match source {
            JsonValue::String(string) => Some(string),
            _ => None,
        }
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        JsonValue::String(target)
    }
}

pub struct JsonArray;

impl PrismRef for JsonArray {
    type Source = JsonValue;
    type Target = Vec<JsonValue>;

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target> {
        source.as_array().cloned()
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        JsonValue::Array(target)
    }
}

pub struct JsonIndex {
    index: usize,
}

impl OptionalRef for JsonIndex {
    type Source = Vec<JsonValue>;
    type Target = JsonValue;

    fn get_optional_ref(&self, source: Self::Source) -> Option<Self::Target> {
        source.get(self.index).cloned()
    }

    fn set_or_replace_ref(&self, mut source: Self::Source, target: Self::Target) -> Self::Source {
        match source.get_mut(self.index) {
            Some(value) => {
                *value = target;
            }
            _ => {}
        };
        source
    }
}

pub struct JsonObject;

impl PrismRef for JsonObject {
    type Source = JsonValue;
    type Target = Map<String, JsonValue>;

    fn get_option_ref(&self, source: Self::Source) -> Option<Self::Target> {
        match source {
            JsonValue::Object(object) => Some(object),
            _ => None,
        }
    }

    fn set_ref(&self, source: Self::Source, target: Self::Target) -> Self::Source {
        JsonValue::Object(target)
    }
}

pub struct JsonProperty {
    property: String,
}

impl OptionalRef for JsonProperty {
    type Source = Map<String, JsonValue>;
    type Target = JsonValue;

    fn get_optional_ref(&self, source: Self::Source) -> Option<Self::Target> {
        source.get(&self.property).cloned()
    }

    fn set_or_replace_ref(&self, mut source: Self::Source, target: Self::Target) -> Self::Source {
        match source.get_mut(&self.property) {
            Some(value) => {
                *value = target;
            }
            _ => {}
        };
        source
    }
}
