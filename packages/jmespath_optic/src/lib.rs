use jmespath::ast::Ast;
use serde_json::Value;

pub trait JmesTraversal {
    fn modify_json_value(&self, source: Value, target: Value) -> Option<Value>;
}

impl JmesTraversal for &Ast {
    fn modify_json_value(&self, source: Value, target: Value) -> Option<Value> {
        match self {
            Ast::Identity { .. } => target.into(),
            Ast::Index { idx, .. } => {
                // todo - take from source, not by cloning
                let mut array = source.as_array()?.to_owned();
                let index = if *idx >= 0 {
                    *idx
                } else {
                    *idx + (array.len() as i32)
                };
                let item = array.get_mut(index as usize)?;
                *item = target;
                Some(array.into())
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
        let expression = jmespath::compile("@").unwrap();
        let ast = expression.as_ast();

        let source = json!({ "hello": "world"});
        let target = json!("my man");
        let result: Value = ast.modify_json_value(source, target.clone()).unwrap();
        assert_eq!(result, target);
    }

    #[test]
    fn index() {
        let expression = jmespath::compile("[0]").unwrap();
        let ast = expression.as_ast();

        let source = json!(["world"]);
        let target = json!("sup");
        let expected = json!([target]);
        let result: Value = ast.modify_json_value(source, target.clone()).unwrap();
        assert_eq!(result, expected);
    }
}
