import { ThemeProvider } from '@mui/material';
import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { Json } from 'fp-ts/lib/Json';
import { flow, pipe } from 'fp-ts/lib/function';
import * as decoder from 'io-ts/Decoder';
import {
  App,
  MarkdownRenderChild,
  Notice,
  Plugin,
  PluginManifest,
  YamlParseError,
  parseYaml,
} from 'obsidian';
import * as React from 'react';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { Application } from './components';
import { ApplicationProvider } from './components/context';
import { useTheme } from './components/material';
import { configuration } from './config';
import { ApplicationSettings } from './settings';

type Handler = Parameters<Plugin['registerMarkdownCodeBlockProcessor']>[1];

const yamlfy: (string: string) => Either<YamlParseError, Json> =
  either.tryCatchK(parseYaml, (error) => error as never);

const notify = (error: any) => {
  new Notice(error, 0);
  return error as never;
};

export class MainPlugin extends Plugin {
  public settings = new ApplicationSettings(this);

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  async onload(): Promise<void> {
    this.addSettingTab(this.settings);
    this.registerMarkdownCodeBlockProcessors();
  }

  // todo - apply cleanup
  // todo - create DIY code block processor that allows ```lang plugin-name
  registerMarkdownCodeBlockProcessors() {
    this.registerMarkdownCodeBlockProcessor(
      'data-entry',
      this.handleCodeBlockProcessor,
    );
  }

  handleCodeBlockProcessor: Handler = async (source, element, context) => {
    const { path } = this.app.workspace.getActiveFile()!;
    console.debug({ source });

    const settings = this.settings.settings;
    console.debug({ settings });

    const config = pipe(
      yamlfy(source),
      either.chainW(
        flow(
          configuration({
            datasource: {
              path,
              frontmatter: settings.datasource.frontmatter,
            }, // todo - change to `datasource`
            schema: { path, frontmatter: settings.schema.frontmatter },
            uischema: { path, frontmatter: settings.uischema.frontmatter },
          }).decode,
          either.mapLeft(decoder.draw),
        ),
      ),
      either.getOrElseW(notify),
    );

    console.debug({ config });

    const Component = () => (
      <StrictMode>
        <ThemeProvider theme={useTheme()}>
          <ApplicationProvider value={{ app: this.app, config }}>
            <Application />
          </ApplicationProvider>
        </ThemeProvider>
      </StrictMode>
    );

    const container = element.createEl('div');
    const renderer = new ReactMarkdownRenderChild(<Component />, container);
    context.addChild(renderer);
  };
}

class ReactMarkdownRenderChild extends MarkdownRenderChild {
  root: Root;

  constructor(
    private children: React.JSX.Element,
    containerEl: HTMLElement,
  ) {
    super(containerEl);
    this.root = createRoot(containerEl);
  }

  async onload() {
    this.root.render(this.children);
  }

  async unload() {
    this.root.unmount();
  }
}
