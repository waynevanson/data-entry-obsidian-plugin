import { ThemeProvider } from '@mui/material';
import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { Json } from 'fp-ts/lib/Json';
import { flow, pipe } from 'fp-ts/lib/function';
import * as decoder from 'io-ts/Decoder';
import {
  App,
  Command,
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

const createJsonify = (
  yaml: boolean,
): ((
  string: string,
) => Either<YamlParseError | TypeError | SyntaxError, Json>) =>
  either.tryCatchK(yaml ? parseYaml : JSON.parse, (error) => error as never);

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
    const yamls = ['yaml', 'yml'];
    const jsons = ['json', 'jsn', 'jsonc'];
    const files = yamls.concat(...jsons);
    const name = 'data-entry';

    files.forEach((extension) =>
      this.registerMarkdownCodeBlockProcessor(
        `${extension}-${name}`,
        this.handleCodeBlockProcessor(extension, yamls),
      ),
    );
  }

  handleCodeBlockProcessor(
    extension: string,
    yamls: ReadonlyArray<string>,
  ): Handler {
    return async (source, element, context) => {
      const { path } = this.app.workspace.getActiveFile()!;
      console.debug({ source });

      const contents = createJsonify(yamls.includes(extension))(source);
      console.debug({ contents });

      const settings = this.settings.settings;

      const config = pipe(
        contents,
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

const removeCodeFence = (string: string) => {
  const regex = /(?:```)(?<type>.*)\n(?<content>[^`]+)\n(?:```)/;
  const groups = regex.exec(string)?.groups as
    | Record<'type' | 'content', string>
    | undefined;
  return groups;
};

const addCodeFence = (string: string, format = '') =>
  [['``` ', format, ' data-entry'].join(''), string, '```'].join('\n');

export const getCommandByName = (
  app: App,
  name: string,
): Command | undefined => {
  //@ts-expect-error
  const allCommands: Array<Command> = app.commands.listCommands();
  const command = allCommands.find(
    (command) =>
      command.name.toUpperCase().trim() === name.toUpperCase().trim(),
  );
  return command;
};

export const getCommandById = (app: App, id: string): Command | undefined => {
  //@ts-expect-error
  const allCommands: Array<Command> = app.commands.listCommands();
  const command = allCommands.find((command) => command.id === id);
  return command;
};
