mod utils;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
enum Element<A = ()>
where
    A: Default,
{
    Object {
        #[serde(rename = "$ref")]
        reference: String,
        #[serde(alias = "props")]
        options: Option<A>,
    },
    Expression(String),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
enum StringComponent {
    Text(Element),
    Textarea(Element),
    Select(Element),
}

#[derive(JsonSchema, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
enum BooleanComponent {
    Checkbox(Element),
    Switch(Element),
    Toggle(Element),
}
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
enum NumberComponent {
    Number(Element),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
enum ArrayComponent {
    Checkbox(Element),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
enum Component {
    String(StringComponent),
    Number(NumberComponent),
    Boolean(BooleanComponent),
    Array(ArrayComponent),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
enum Structure {
    One(Component),
    Many {
        #[serde(rename = "$ref")]
        reference: String,
        array: Box<Structure>,
    },
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
pub struct UISchema(Structure);
