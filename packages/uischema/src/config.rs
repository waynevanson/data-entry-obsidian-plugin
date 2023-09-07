use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub trait SchemaReference {
    fn into_jsme_query(self) -> String;
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
pub enum Element<A = ()> {
    Object {
        #[serde(rename = "$ref")]
        reference: String,
        #[serde(alias = "props")]
        options: Option<A>,
    },
    Expression(String),
}

impl<A> SchemaReference for Element<A> {
    fn into_jsme_query(self) -> String {
        match self {
            Element::Expression(reference) => reference,
            Element::Object { reference, .. } => reference,
        }
    }
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum StringComponent {
    Text(Element),
    Textarea(Element),
    Select(Element),
}

impl SchemaReference for StringComponent {
    fn into_jsme_query(self) -> String {
        match self {
            Self::Select(element) => element.into_jsme_query(),
            Self::Text(element) => element.into_jsme_query(),
            Self::Textarea(element) => element.into_jsme_query(),
        }
    }
}

#[derive(JsonSchema, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum BooleanComponent {
    Checkbox(Element),
    Switch(Element),
    Toggle(Element),
}

impl SchemaReference for BooleanComponent {
    fn into_jsme_query(self) -> String {
        match self {
            Self::Checkbox(element) => element.into_jsme_query(),
            Self::Switch(element) => element.into_jsme_query(),
            Self::Toggle(element) => element.into_jsme_query(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum NumberComponent {
    Number(Element),
}

impl SchemaReference for NumberComponent {
    fn into_jsme_query(self) -> String {
        match self {
            Self::Number(element) => element.into_jsme_query(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ArrayComponent {
    Checkbox(Element),
}

impl SchemaReference for ArrayComponent {
    fn into_jsme_query(self) -> String {
        match self {
            Self::Checkbox(element) => element.into_jsme_query(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ComponentValue {
    String(StringComponent),
    Number(NumberComponent),
    Boolean(BooleanComponent),
    Array(ArrayComponent),
}

impl SchemaReference for ComponentValue {
    fn into_jsme_query(self) -> String {
        match self {
            Self::Array(component) => component.into_jsme_query(),
            Self::Boolean(component) => component.into_jsme_query(),
            Self::Number(component) => component.into_jsme_query(),
            Self::String(component) => component.into_jsme_query(),
        }
    }
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

pub fn get_jmespath_queries(uischemable: UISchemable) -> Vec<String> {
    match uischemable {
        UISchemable::Many { reference, array } => {
            let mut scopes = get_jmespath_queries(*array);
            scopes.push(reference);
            scopes
        }
        UISchemable::One(component) => match *component {
            Component::Layout(layout) => match layout {
                ComponentLayout::Horizontal(uischemable) => get_jmespath_queries(uischemable),
                ComponentLayout::Vertical(uischemable) => get_jmespath_queries(uischemable),
                ComponentLayout::Label(..) => vec![],
            },
            Component::Value(value) => vec![value.into_jsme_query()],
        },
    }
}

// fn from_jmes_ast_to_traversal(jmes_ast: Ast) -> impl TraversalRef<Source = Value, Target = Value> {
//     match jmes_ast {
//         Ast::And { lhs, rhs, .. } => from_jmes_ast_to_traversal(*lhs),
//         Ast::Identity { .. } => TraversalConstructor::<Value, Option<Value>>::new(),
//     }
// }

// how could I use jmespath to create optics?
// thought I'd be able to traverse the AST, which is possible.
// seems like a lot of work.
// is there a computed version of the expression where the pipe operators are compiled (required?)
// AST -> Optics for JSONValue

//
// Instead of referencing the schema for the optic, let's use the data because that's what really matters.
// if it doesn't match what it's supposed to then we'll do the thing.
pub enum ScopePathStep {
    ObjectByProperty(String),
    ArrayElements,
}
