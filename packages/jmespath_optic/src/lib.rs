use jmespath::ast::Ast;
use serde_json::Value;

pub trait JmesTraversal {
    fn modify_json_value(&self, source: Value, target: Value) -> Value;
}

impl JmesTraversal for &Ast {
    fn modify_json_value(&self, source: Value, target: Value) -> Value {
        match self {
            Ast::Identity { .. } => target,
            Ast::And { lhs, rhs, .. } => target,
            _ => todo!(),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn identity() {
        let expression = jmespath::compile("@").unwrap();
        let ast = expression.as_ast();
        assert_eq!(ast, &Ast::Identity { offset: 0 });

        let source: Value = serde_json::from_str(r#"{ "hello": "world" }"#).unwrap();
        let target = source.clone();
        let result: Value = ast.modify_json_value(source, target.clone());
        assert_eq!(result, target);
    }
}
