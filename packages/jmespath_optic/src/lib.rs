use jmespath::{ast::Ast, interpreter::interpret, parse, Context, Runtime};
use serde_json::Value;
use std::rc::Rc;

pub struct Traversal<'context> {
    ast: Ast,
    context: Context<'context>,
}

impl<'context> Traversal<'context> {
    pub fn new(expression: &'context str, runtime: &'context Runtime) -> Self {
        let context = Context::new(expression, runtime);
        let ast = parse(expression).unwrap();

        Self { ast, context }
    }

    pub fn modify_option(
        mut self,
        source: Value,
        modify: impl Fn(Value) -> Value,
    ) -> Option<Value> {
        match self.ast {
            Ast::Identity { .. } => Some(modify(source)),
            Ast::Index { idx, .. } => {
                let mut array = source.as_array()?.to_owned();
                let index = if idx >= 0 {
                    idx
                } else {
                    idx + (array.len() as i32)
                };
                let target = array.get(index as usize)?.to_owned();
                let element = array.get_mut(index as usize)?;
                *element = modify(target);
                Some(array.into())
            }
            Ast::Field { name, .. } => {
                let mut object = source.as_object()?.to_owned();
                let target = object.get(&name)?.to_owned();
                let element = object.get_mut(&name)?;
                *element = modify(target);
                Some(object.into())
            }
            Ast::And { lhs, rhs, .. } => {
                let data = Rc::new(source.clone().try_into().ok()?);
                let interpretted = interpret(&data, &lhs, &mut self.context).ok()?;
                let ast = *if !interpretted.is_truthy() { lhs } else { rhs };
                Traversal {
                    ast,
                    context: self.context,
                }
                .modify_option(source, modify)
            }
            Ast::Or { lhs, rhs, .. } => {
                let data = Rc::new(source.clone().try_into().ok()?);
                let interpretted = interpret(&data, &lhs, &mut self.context).ok()?;
                let ast = *if interpretted.is_truthy() {
                    Some(lhs)
                } else if interpret(&data, &rhs, &mut self.context).ok()?.is_truthy() {
                    Some(rhs)
                } else {
                    None
                }?;
                Traversal {
                    ast,
                    context: self.context,
                }
                .modify_option(source, modify)
            }
            _ => todo!(),
        }
    }

    pub fn set(self, source: Value, target: Value) -> Value {
        self.set_option(source.clone(), target).unwrap_or(source)
    }

    pub fn set_option(self, source: Value, target: Value) -> Option<Value> {
        self.modify_option(source, |_| target.clone())
    }

    pub fn modify(self, source: Value, target: Value) -> Value {
        self.modify_option(source.clone(), |_| target.clone())
            .unwrap_or(source)
    }
}
#[cfg(test)]
mod test {
    use super::*;
    use serde_json::{json, Value};

    #[test]
    fn identity() {
        let runtime = Runtime::new();
        let traversal = Traversal::new("@", &runtime);

        let source = json!({ "hello": "world"});
        let target = json!("my man");
        let expected = target.clone();

        let result: Value = traversal.set_option(source, target).unwrap();
        assert_eq!(result, expected);
    }

    // todo - negative indexes
    #[test]
    fn index_positive() {
        let runtime = Runtime::new();
        let traversal = Traversal::new("[0]", &runtime);

        let source = json!(["world"]);
        let target = json!("sup");
        let expected = json!([target]);

        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn index_negative() {
        let runtime = Runtime::new();
        let traversal = Traversal::new("[-1]", &runtime);

        let source = json!(["world", "earth", "globe"]);
        let target = json!("sup");
        let expected = json!(["world", "earth", target]);
        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn field() {
        let runtime = Runtime::new();
        let traversal = Traversal::new("hello", &runtime);

        let source = json!({ "hello": "world" });
        let target = json!("sup");
        let expected = json!({ "hello": target });
        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_left() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello && goodbye"#, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": target, "goodbye": "earth"});
        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_right() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello && goodbye"#, &runtime);

        let source = json!({ "hello": "world", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "world", "goodbye": target });
        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn or_left() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello || goodbye"#, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "", "goodbye": target});
        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn or_right() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello || goodbye"#, &runtime);

        let source = json!({ "hello": "world", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": target, "goodbye": "earth" });
        let result: Value = traversal.set_option(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn or_null() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello || goodbye"#, &runtime);

        let source = json!({ "hello": "", "goodbye": "" });
        let target = json!("sup");
        let result: Option<Value> = traversal.set_option(source, target.clone());
        assert_eq!(result, None);
    }
}
