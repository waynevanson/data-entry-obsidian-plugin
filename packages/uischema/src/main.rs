use schemars::schema_for;
use uischema::UISchema;

fn main() {
    let schema = schema_for!(UISchema);
    let output = serde_json::to_string_pretty(&schema).unwrap();
    std::fs::write("schema.json", output).unwrap();
}
