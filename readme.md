# Data Entry - Obsidian Plugin

Create beautiful forms for use in data entry contexts.

## WIP

This is a work in progress. Releases are put through there paces in the hopes that things don't break.

You can use it if you want, but there are no guarentees.

## Installing plugins and stuff

```sh
VAULT_DIRECTORY=".vault"
PLUGIN_NAME_KEBAB_CASE="data-entry"

git submodule add git@github.com:pjeby/hot-reload.git $VAULT_DIRECTORY/.obsidian/plugin/hot-reload

mkdir -r .vault/.obsidian/plugins/$PLUGIN_NAME_KEBAB_CASE
ln -rs ./main.js .vault/.obsidian/plugins/$PLUGIN_NAME_KEBAB_CASE/main.js
```
