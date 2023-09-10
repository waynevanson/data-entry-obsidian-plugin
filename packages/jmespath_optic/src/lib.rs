use std::{default, rc::Rc};

use jmespath::{ast::Ast, interpreter::interpret, parse, runtime, Context, Runtime};
use serde_json::Value;

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

    pub fn set(mut self, source: Value, target: Value) -> Option<Value> {
        match self.ast {
            Ast::Identity { .. } => target.into(),
            Ast::Index { idx, .. } => {
                let mut array = source.as_array()?.to_owned();
                let index = if idx >= 0 {
                    idx
                } else {
                    idx + (array.len() as i32)
                };
                let item = array.get_mut(index as usize)?;
                *item = target;
                Some(array.into())
            }
            Ast::Field { name, .. } => {
                let mut object = source.as_object()?.to_owned();
                let item = object.get_mut(&name)?;
                *item = target;
                Some(object.into())
            }
            Ast::And { lhs, rhs, .. } => {
                let data = Rc::new(source.clone().try_into().ok()?);
                let interpretted = interpret(&data, &lhs, &mut self.context).ok()?;
                let ast = if !interpretted.is_truthy() {
                    *lhs
                } else {
                    *rhs
                };
                Traversal {
                    ast,
                    context: self.context,
                }
                .set(source, target)
            }
            _ => todo!(),
        }
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

        let result: Value = traversal.set(source, target).unwrap();
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

        let result: Value = traversal.set(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn index_negative() {
        let runtime = Runtime::new();
        let traversal = Traversal::new("[-1]", &runtime);

        let source = json!(["world", "earth", "globe"]);
        let target = json!("sup");
        let expected = json!(["world", "earth", target]);
        let result: Value = traversal.set(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn field() {
        let runtime = Runtime::new();
        let traversal = Traversal::new("hello", &runtime);

        let source = json!({ "hello": "world" });
        let target = json!("sup");
        let expected = json!({ "hello": target });
        let result: Value = traversal.set(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_left() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello && goodbye"#, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": target, "goodbye": "earth"});
        let result: Value = traversal.set(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_right() {
        let runtime = Runtime::new();
        let traversal = Traversal::new(r#"hello && goodbye"#, &runtime);

        let source = json!({ "hello": "world", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "world", "goodbye": target });
        let result: Value = traversal.set(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }
}
