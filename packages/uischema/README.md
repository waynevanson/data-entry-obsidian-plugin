# UISCHEMA

## Rust

Welp.

Rust can provide implementations for many things we'd have to do by hand. If we break the features into modular pieces, then we can incrementally adopt stuff into the JS world.

### Features

Here are some nice to haves that we could join together.

- [x] Serialize from Rust types into Typescript types, schemars into openapi to typescirpt
- [x] Deserialize from YAML or JSON via SERDE
- [ ] Implement UISCHEMA data types in Rust for use in our app
- [x] [Validation for JSON schema](https://github.com/GREsau/schemars), to validate the users schema.
      https://github.com/Stranger6667/jsonschema-rs

schemasrs -> json schema -> typescript defs
https://dev.to/dimfeld/synchronizing-rust-types-with-typescript-1maa
