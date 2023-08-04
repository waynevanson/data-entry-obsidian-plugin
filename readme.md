# Data Entry - Obsidian Plugin

Create beautiful forms for use in data entry contexts.

## WIP

This is a work in progress. Releases are put through there paces in the hopes that things don't break.

You can use it if you want, but there are no guarentees.

## Usage

-   Go to a new file and go to source mode
-   Add code block with `yaml-data-entry` or `json-data-entry` in the format section.
-   Within the code block add
    -   Add `datasource.file` with `.md` extension on it that you would like to save the data to.
        -   Create this file if it does not exist already.
    -   Add your schema within `form.schema`.
    -   All properties within `form` are passed to `jsonforms`.
-   Go to reading mode
-   Use the GUI to create and save data to you file!

Check out the _Schema_, _UI Schema_ and _Data_ sections for additional understanding.

## Installing plugins and stuff

```sh
VAULT_DIRECTORY=".vault"
PLUGIN_NAME_KEBAB_CASE="data-entry"

git submodule add git@github.com:pjeby/hot-reload.git $VAULT_DIRECTORY/.obsidian/plugin/hot-reload

mkdir -r .vault/.obsidian/plugins/$PLUGIN_NAME_KEBAB_CASE
ln -rs ./main.js .vault/.obsidian/plugins/$PLUGIN_NAME_KEBAB_CASE/main.js
```
