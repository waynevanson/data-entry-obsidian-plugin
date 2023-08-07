# Data Entry - Obsidian Plugin

Create beautiful forms for use in data entry contexts.

## WIP

This is a work in progress. Releases are put through there paces in the hopes that things don't break.

You can use it if you want, but there are no guarentees.

## Installation

This plugin is currently not available in the Obsidian plugin store.
The easiest way to install the plugin is using the `BRAT` plugin.

1. Enable the community plugins on your devices running obsidian by following [these instructions](https://obsidian.rocks/how-to-use-community-plugins-in-obsidian).
2. Install BRAT from the community plugins search by searching for "BRAT".
3. Follow the instructions for [adding a beta plugin](https://tfthacker.com/Obsidian+Plugins+by+TfTHacker/BRAT+-+Beta+Reviewer's+Auto-update+Tool/Quick+guide+for+using+BRAT)
    - The GitHub URL for this repository is "https://github.com/waynevanson/obsidian-plugin-data-entry".
4. Refresh the plugin list and enable the plugin "Data Entry".

Here is an example entry point.

<pre>
```yaml-data-entry
datasource:
    file: data.md
forms:
  schema:
    properties:
      name:
        type: string
      age:
        type: integer
```
</pre>

Going to the read mode shows the form.

## Usage

In order to get a large benefit using this tool, you will need to understand the following technologies:

-   YAML/JSON
-   JSONSCHEMA
-   JSONFORMS

We are looking into ways to decrease this entry point, by making a GUI editor for JSONSCHEMA and maybe JSONFORMS.

### Quick Start

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

### Configuration

The configuration is always used when creating a form. Without it, there is no form to fill in and no data to fill it with.

#### Datasource

| Property          | Type     | Description                                                | Resources |
| :---------------- | :------- | :--------------------------------------------------------- | :-------- |
| `datasource.file` | `string` | The file path where data is saved to, relative to the root |           |

#### Forms

The configuration passed to JsonForms that is used for validation and presenting the form

| Property         | Type         | Description | Resources |
| :--------------- | :----------- | :---------- | :-------- |
| `forms.schema`   | `JsonSchema` |             |           |
| `forms.uischema` | `UiSchema`   |             |           |

> todo
>
> -   rename `forms` to `form`
