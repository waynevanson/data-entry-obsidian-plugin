
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};


pub trait SchemaReference {
    fn into_jsme_query(self) -> String;
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
#[serde(untagged)]
pub enum Element<A = ()> {
    Object {
        scope: String,
        #[serde(alias = "props")]
        options: Option<A>,
    },
    Expression(String),
}

impl<A> SchemaReference for Element<A> {
    fn into_jsme_query(self) -> String {
        match self {
            Element::Expression(reference) => reference,
            Element::Object {
                scope: reference, ..
            } => reference,
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
        scope: String,
        array: Box<UISchemable>,
    },
}

#[derive(Debug, Deserialize, Serialize, JsonSchema)]
pub struct UISchema(UISchemable);

pub fn get_jmespath_queries(uischemable: UISchemable) -> Vec<String> {
    match uischemable {
        UISchemable::Many { scope, array } => {
            let mut scopes = get_jmespath_queries(*array);
            scopes.push(scope);
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

#[cfg(test)]
mod test {
    use std::rc::Rc;

    #[test]
    fn test() {
        let expression = jmespath::compile("@").unwrap();
        let variable = jmespath::Variable::from_json(r#"{ "hello": "world" }"#).unwrap();
        let result = expression.search(variable).unwrap();
        let keys = result.as_object().unwrap().keys().collect::<Vec<_>>();
        let values = result.as_object().unwrap().values().collect::<Vec<_>>();
        assert_eq!(keys, vec![&"hello".to_string()]);
        assert_eq!(
            values,
            vec![&Rc::new(
                jmespath::Variable::from_json(r#""world""#).unwrap()
            )]
        );
    }
}
