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

## Usage

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
