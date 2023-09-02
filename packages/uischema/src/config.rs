use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
pub enum Element<A = ()>
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
pub enum StringComponent {
    Text(Element),
    Textarea(Element),
    Select(Element),
}

#[derive(JsonSchema, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum BooleanComponent {
    Checkbox(Element),
    Switch(Element),
    Toggle(Element),
}
#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum NumberComponent {
    Number(Element),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ArrayComponent {
    Checkbox(Element),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ComponentValue {
    String(StringComponent),
    Number(NumberComponent),
    Boolean(BooleanComponent),
    Array(ArrayComponent),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ComponentLayout {
    Label(String),
    Horizontal(UISchemable),
    Vertical(UISchemable),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
pub enum Component {
    Value(ComponentValue),
    Layout(ComponentLayout),
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
pub enum UISchemable {
    One(Box<Component>),
    Many {
        #[serde(rename = "$ref")]
        reference: String,
        array: Box<UISchemable>,
    },
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
pub struct UISchema(UISchemable);
