use jmespath::{ast::Ast, interpreter::interpret, Context, ToJmespath, DEFAULT_RUNTIME};
use js_sys::Function;
use serde::Serialize;
use serde_json::Value;
use serde_wasm_bindgen::Serializer;
use std::rc::Rc;
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

pub struct TraversalImpl<'a> {
    ast: &'a Ast,
    expression: &'a str,
}

impl<'a> TraversalImpl<'a> {
    fn as_impl_by_ast<'b: 'a>(&'b self, ast: &'b Ast) -> Self {
        TraversalImpl {
            ast,
            expression: &self.expression,
        }
    }

    fn modify_option_by_context(
        &self,
        context: &mut Context,
        source: Value,
        kleisli: &dyn Fn(Value) -> Option<Value>,
    ) -> Option<Value> {
        match self.ast {
            Ast::Identity { .. } => kleisli(source),
            Ast::Index { idx, .. } => {
                let mut array = source.as_array()?.to_owned();
                let idx = *idx;
                let index = if idx >= 0 {
                    idx
                } else {
                    idx + (array.len() as i32)
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
                self.as_impl_by_ast(ast)
                    .modify_option_by_context(context, source, kleisli)
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

                self.as_impl_by_ast(ast)
                    .modify_option_by_context(context, source, kleisli)
            }
            Ast::Subexpr {
                ref lhs, ref rhs, ..
            } => {
                let left = self.as_impl_by_ast(lhs);
                let right = self.as_impl_by_ast(rhs);

                left.modify_option_by_context(context, source, &|target| {
                    right.modify_option_by_context(
                        &mut Context::new(self.expression, &DEFAULT_RUNTIME),
                        target,
                        kleisli,
                    )
                })
            }
            Ast::Comparison { .. } => unimplemented!(),
            _ => todo!(),
        }
    }
}

#[wasm_bindgen]
pub struct Traversal {
    expression: String,
    ast: Ast,
}

#[wasm_bindgen]
impl Traversal {
    fn as_impl(&self) -> TraversalImpl {
        TraversalImpl {
            ast: &self.ast,
            expression: &self.expression,
        }
    }

    #[wasm_bindgen(constructor)]
    pub fn new(expression: &str) -> Self {
        let ast = jmespath::parse(expression).unwrap();
        Self {
            expression: expression.to_owned(),
            ast,
        }
    }

    #[wasm_bindgen]
    pub fn get_option(&self, source: JsValue) -> JsValue {
        let serializer = Serializer::new().serialize_maps_as_objects(true);
        let mut ctx = Context::new(&self.expression, &DEFAULT_RUNTIME);
        let source: Value = serde_wasm_bindgen::from_value(source).unwrap();
        let rcvar = source.to_jmespath().unwrap();
        let target = interpret(&rcvar, &rcvar, &self.ast, &mut ctx).unwrap();
        target.serialize(&serializer).unwrap()
    }

    #[wasm_bindgen]
    pub fn modify_option(&self, source: JsValue, kleisli: &Function) -> JsValue {
        let serializer = Serializer::new().serialize_maps_as_objects(true);
        let context = &mut Context::new(&self.expression, &DEFAULT_RUNTIME);

        let source: Value = serde_wasm_bindgen::from_value(source).unwrap();
        let kleisli = |target: Value| -> Option<Value> {
            let target: JsValue = target.serialize(&serializer).unwrap();
            let target = kleisli.call1(&JsValue::UNDEFINED, &target).unwrap();
            if target.is_undefined() {
                None
            } else {
                let target: Value = serde_wasm_bindgen::from_value(target).unwrap();
                Some(target)
            }
        };

        self.as_impl()
            .modify_option_by_context(context, source, &kleisli)
            .map(|value| value.serialize(&serializer).unwrap())
            .unwrap_or(JsValue::undefined())
    }

    #[wasm_bindgen]
    pub fn modify(&self, source: JsValue, endomorphism: &Function) -> JsValue {
        let serializer = Serializer::new().serialize_maps_as_objects(true);
        let context = &mut Context::new(&self.expression, &DEFAULT_RUNTIME);

        let source: Value = serde_wasm_bindgen::from_value(source).unwrap();
        let kleisli = |target: Value| -> Option<Value> {
            let target: JsValue = target.serialize(&serializer).unwrap();
            let target = endomorphism.call1(&JsValue::UNDEFINED, &target).unwrap();
            if target.is_undefined() {
                panic!("cannot return undefined as a json value in Traversal.modify")
            }
            let target: Value = serde_wasm_bindgen::from_value(target).unwrap();
            Some(target)
        };

        self.as_impl()
            .modify_option_by_context(context, source, &kleisli)
            .map(|value| value.serialize(&serializer).unwrap())
            .unwrap_or(JsValue::undefined())
    }

    #[wasm_bindgen]
    pub fn set(&self, source: JsValue, target: JsValue) -> JsValue {
        let serializer = Serializer::new().serialize_maps_as_objects(true);
        let context = &mut Context::new(&self.expression, &DEFAULT_RUNTIME);

        let source: Value = serde_wasm_bindgen::from_value(source).unwrap();
        if target.is_undefined() {
            panic!("cannot return undefined as a json value in Traversal.set")
        }
        let target: Value = serde_wasm_bindgen::from_value(target).unwrap();
        let kleisli = |_| -> Option<Value> { Some(target.clone()) };

        self.as_impl()
            .modify_option_by_context(context, source, &kleisli)
            .map(|value| value.serialize(&serializer).unwrap())
            .unwrap_or(JsValue::undefined())
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
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, runtime);

        let traversal = TraversalImpl { ast, expression };

        let source = json!({ "hello": "world"});
        let target = json!("my man");
        let expected = target.clone();
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn index_positive() {
        let runtime = Runtime::new();
        let expression = "[0]";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!(["world"]);
        let target = json!("sup");
        let expected = json!([target]);

        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn index_negative() {
        let runtime = Runtime::new();
        let expression = "[-1]";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!(["world", "earth", "globe"]);
        let target = json!("sup");
        let expected = json!(["world", "earth", target]);
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn field() {
        let runtime = Runtime::new();
        let expression = "hello";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "world" });
        let target = json!("sup");
        let expected = json!({ "hello": target });
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_left() {
        let runtime = Runtime::new();
        let expression = "hello && goobye";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": target, "goodbye": "earth"});
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn and_right() {
        let runtime = Runtime::new();
        let expression = "hello && goodbye";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "world", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "world", "goodbye": target});
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn or_left() {
        let runtime = Runtime::new();
        let expression = "hello || goodbye";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "", "goodbye": target});
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn or_right() {
        let runtime = Runtime::new();
        let expression = "hello || goodbye";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "earth" });
        let target = json!("sup");
        let expected = json!({ "hello": "", "goodbye": target });
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();

        assert_eq!(result, expected);
    }

    #[test]
    fn or_null() {
        let runtime = Runtime::new();
        let expression = "hello || goodbye";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": "", "goodbye": "" });
        let target = json!("sup");
        let traversal = TraversalImpl { ast, expression };
        let result: Option<Value> =
            traversal.modify_option_by_context(context, source, &|_| Some(target.clone()));
        assert_eq!(result, None);
    }

    #[test]
    fn subexpr_pipe() {
        let runtime = Runtime::new();
        let expression = "hello | goodbye";
        let ast = &parse(expression).unwrap();
        let context = &mut Context::new(expression, &runtime);

        let source = json!({ "hello": { "goodbye": "earth" } });
        let target = json!("sup");
        let traversal = TraversalImpl { ast, expression };
        let result: Value = traversal
            .modify_option_by_context(context, source, &|_| Some(target.clone()))
            .unwrap();

        let expected = json!({ "hello": { "goodbye": target}});
        assert_eq!(result, expected);
    }
}
