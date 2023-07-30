All config goes here.

Creating this config creates a form and registers a command.

If destination is a folder, it will store each entry in a note.
If destination is a file, it will store all entries within the note.

All as JSON files.

<!-- read file, yaml or json -->
<!-- datasource must be invariant, meaning it needs to use it's information to read and write the file -->

```yaml-data-entry
datasource:
    templater:
        template: Template Name.md
forms:
    schema:
        properties:
            name:
                type: string
    uischema:
```
