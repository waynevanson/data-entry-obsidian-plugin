import deepmerge from 'deepmerge';
import { Notice, PluginSettingTab, Setting } from 'obsidian';
import { MainPlugin } from './plugin';

export type SettingsConfiguration = Record<
  'datasource' | 'schema' | 'uischema',
  { frontmatter: string }
>;

export class ApplicationSettings extends PluginSettingTab {
  public settings: SettingsConfiguration = {
    datasource: { frontmatter: 'data' },
    schema: { frontmatter: 'schema' },
    uischema: { frontmatter: 'uischema' },
  };

  public listeners: Record<string, Array<(...args: Array<unknown>) => unknown>>;

  constructor(public plugin: MainPlugin) {
    super(plugin.app, plugin);
  }

  async load() {
    const data = await this.plugin.loadData();
    this.settings = deepmerge(this.settings, data?.settings ?? {});
  }

  async save() {
    const data = await this.plugin.loadData();
    data.settings = this.settings;
    this.plugin.saveData(data);
  }

  display() {
    this.containerEl.empty();

    this.containerEl.createEl('h1').setText('Data Entry');
    this.containerEl.createEl('h2').setText('Configuration');
    this.containerEl.createEl('h3').setText('Defaults');

    this.containerEl
      .createEl('p')
      .setText(['Customise the defaults to suit your workflow.'].join('\n'));

    this.containerEl.createEl('h4').setText('Frontmatter');

    this.containerEl
      .createEl('p')
      .setText(
        [
          'Data Entry can read your data, schema and uischema from user defined metadata called frontmatter.',
          'Changing these is useful to avoid clashing with other plugins or when you have a preferred naming convention for metadata.',
          'Dotted paths are not yet supported.',
        ].join('\n'),
      );

    new Setting(this.containerEl)
      .setName('Datasource')
      .setDesc('datasource.file.frontmatter')
      .addText((text) =>
        text.setValue(this.settings.datasource.frontmatter).onChange((text) => {
          this.settings.datasource.frontmatter = text;
          this.save();
        }),
      )
      .setDisabled(false);

    new Setting(this.containerEl)
      .setName('Schema')
      .setDesc('schema.file.frontmatter')
      .addText((text) =>
        text.setValue(this.settings.schema.frontmatter).onChange((text) => {
          this.settings.schema.frontmatter = text;
          this.save();
        }),
      )
      .setDisabled(false);

    new Setting(this.containerEl)
      .setName('UI Schema')
      .setDesc('uischema.file.frontmatter')
      .addText((text) =>
        text.setValue(this.settings.uischema.frontmatter).onChange((text) => {
          this.settings.uischema.frontmatter = text;
          this.save();
        }),
      )
      .setDisabled(false);

    // const save = this.containerEl.createEl('button');
    // save.setCssStyles({
    //   background: 'var(--interactive-accent)',
    //   color: 'var(--text-on-accent)',
    // });
    // save.setText('Save');

    // // todo - cleanup
    // const saver = () =>
    //   this.save().then(
    //     () => new Notice('Settings for Data Entry have been saved!'),
    //   );

    // save.addEventListener('click', saver);
  }
}
