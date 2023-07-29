# Installing plugins and stuff

```sh
VAULT_DIRECTORY=".vault"
PLUGIN_NAME_KEBAB_CASE="data-entry"

git submodule add git@github.com:pjeby/hot-reload.git $VAULT_DIRECTORY/.obsidian/plugin/hot-reload

mkdir -r .vault/.obsidian/plugins/$PLUGIN_NAME_KEBAB_CASE
ln -rs ./main.js .vault/.obsidian/plugins/$PLUGIN_NAME_KEBAB_CASE/main.js
```
