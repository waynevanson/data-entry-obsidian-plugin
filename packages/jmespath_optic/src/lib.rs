use jmespath::{ast::Ast, interpreter::interpret, Context, DEFAULT_RUNTIME};
use serde_json::Value;
use std::rc::Rc;

pub type Kleisi<'a, A> = Box<&'a dyn Fn(A) -> Option<A>>;

pub fn modify_option(
    ast: &Ast,
    context: &mut Context,
    expression: &str,
    source: Value,
    kleisli: Kleisi<Value>,
) -> Option<Value> {
    match ast {
        Ast::Identity { .. } => kleisli(source),
        Ast::Index { ref idx, .. } => {
            let mut array = source.as_array()?.to_owned();
            let index = if idx >= &0 {
                *idx
            } else {
                *idx + (array.len() as i32)
            };
            let target = array.get(index as usize)?.to_owned();
            let element = array.get_mut(index as usize)?;
            *element = kleisli(target)?;
            Some(array.into())
        }
        Ast::Field { ref name, .. } => {
            let mut object = source.as_object()?.to_owned();
            let target = object.get(name)?.to_owned();
            let element = object.get_mut(name)?;
            *element = kleisli(target)?;
            Some(object.into())
        }
        Ast::And {
            ref lhs, ref rhs, ..
        } => {
            let data = Rc::new(source.clone().try_into().ok()?);
            let interpretted = interpret(&data, &data, &lhs, context).ok()?;
            let ast = if !interpretted.is_truthy() { lhs } else { rhs };

            modify_option(&ast, context, expression, source, kleisli)
        }
        Ast::Or {
            ref lhs, ref rhs, ..
        } => {
            let data = Rc::new(source.clone().try_into().ok()?);
            let interpretted = interpret(&data, &data, &lhs, context).ok()?;
            let ast = if interpretted.is_truthy() {
                Some(lhs)
            } else if interpret(&data, &data, &rhs, context).ok()?.is_truthy() {
                Some(rhs)
            } else {
                None
            }?;
            modify_option(ast, context, expression, source, kleisli)
        }
        Ast::Subexpr {
            ref lhs, ref rhs, ..
        } => {
            let closure = |target: Value| {
                modify_option(
                    &*rhs.clone(),
                    &mut Context::new(expression, &DEFAULT_RUNTIME),
                    expression,
                    target,
                    Box::new(kleisli.as_ref()),
                )
            };
            modify_option(lhs, context, expression, source, Box::new(&closure))
        }
        Ast::Comparison { .. } => unimplemented!(),
        _ => todo!(),
    }
}

pub struct Traversal<'a> {
    expression: &'a str,
    ast: Ast,
}

impl<'a> Traversal<'a> {
    pub fn new(expression: &'a str) -> Self {
        let ast = jmespath::parse(expression).unwrap();
        Self { expression, ast }
    }

    pub fn modify_option(&self, source: Value, kleisli: Kleisi<Value>) -> Option<Value> {
        let context = &mut Context::new(&self.expression, &DEFAULT_RUNTIME);
        modify_option(&self.ast, context, &self.expression, source, kleisli)
    }

    pub fn modify(&self, source: Value, modify: impl Fn(Value) -> Value) -> Option<Value> {
        self.modify_option(source, Box::new(&|target| Some(modify(target))))
    }

    pub fn put(&self, source: Value, target: Value) -> Option<Value> {
        self.modify_option(source, Box::new(&|_| Some(target.clone())))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use jmespath::{parse, Runtime, DEFAULT_RUNTIME};
    use serde_json::{json, Value};

    #[test]
    fn identity() {
        let runtime = &DEFAULT_RUNTIME;
        let expression = "@";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, runtime);

        let source = json!({ "hello": "world"});
        let target = json!("my man");
        let expected = target.clone();
        let m = move |_: Value| Some(target.clone());
        let result: Value = modify_option(&ast, context, expression, source, Box::new(&m)).unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn index_positive() {
        let runtime = Runtime::new();
        let expression = "[0]";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!(["world"]);
        let target = json!("sup");
        let expected = json!([target]);

        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&move |_| Some(target.clone())),
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn index_negative() {
        let runtime = Runtime::new();
        let expression = "[-1]";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!(["world", "earth", "globe"]);
        let target = json!("sup");
        let expected = json!(["world", "earth", target]);
        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn field() {
        let runtime = Runtime::new();
        let expression = "hello";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "world" });
        let target = json!("sup");
        let expected = json!({ "hello": target });
        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_left() {
        let runtime = Runtime::new();
        let expression = "hello && goobye";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": target, "goodbye": "earth"});
        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_right() {
        let runtime = Runtime::new();
        let expression = "hello && goodbye";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "world", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "world", "goodbye": target});
        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn or_left() {
        let runtime = Runtime::new();
        let expression = "hello || goodbye";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "", "goodbye": target});
        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn or_right() {
        let runtime = Runtime::new();
        let expression = "hello || goodbye";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "", "goodbye": target });
        let result: Value = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn or_null() {
        let runtime = Runtime::new();
        let expression = "hello || goodbye";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "" });
        let target = json!("sup");
        let result = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        );
        assert_eq!(result, None);
    }

    #[test]
    fn subexpr_pipe() {
        let runtime = Runtime::new();
        let expression = "hello | goodbye";
        let ast = parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": { "goodbye": "earth" } });
        let target = json!("sup");
        let result = modify_option(
            &ast,
            context,
            expression,
            source,
            Box::new(&|_| Some(target.clone())),
        )
        .unwrap();

        let expected = json!({ "hello": { "goodbye": target}});
        assert_eq!(result, expected);
    }
}
