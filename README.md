# Data Entry - Obsidian Plugin

Create forms that modify data in existing notes; the `dataview` plugin for data entry.

Although this plugin exists in the obsidian store, it's still a work in progress.

It does what it says on the tin but doesn't do what it could do.

Feel free to submit issues and discussions with your desires.

Instructions coming soon, check back next week!

## Preview

<details>
<summary>Click to open</summary>

![](./assets/mobile-data.png)
![](./assets/mobile.png)
![](./assets/tablet.png)
![](./assets/desktop.png)

</details>

## Goals

- [x] Create forms using static configuration that modify data in existing notes.
- [ ] Create the schema for forms using a GUI.

## Packages

This repository contains multiple packages to ensure concerns are clearly separated.

- `packages/data-entry` contains the plugin that users install on their devices.
- `packages/obsidian-mocks` contains mocks used to replicate obsidian functionality, as the packages provided by the Obsidian team contains only types and not any implementation for tests.
