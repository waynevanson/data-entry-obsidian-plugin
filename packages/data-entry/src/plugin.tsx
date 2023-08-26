import {
  App,
  Command,
  MarkdownRenderChild,
  Notice,
  Plugin,
  parseYaml,
} from 'obsidian';
import * as React from 'react';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { configuration, Configuration } from './common';
import * as decoder from 'io-ts/Decoder';
import { ThemeProvider } from '@mui/material';
import { ApplicationProvider } from './components/context';
import { Application } from './components';
import { useTheme } from './components/material';
import { either } from 'fp-ts';
import { flow, pipe } from 'fp-ts/lib/function';

type Handler = Parameters<Plugin['registerMarkdownCodeBlockProcessor']>[1];

const notify = (error: any) => {
  new Notice(error);
  return error as never;
};

export class MainPlugin extends Plugin {
  async onload(): Promise<void> {
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
      const jsonify = either.tryCatchK(
        yamls.includes(extension) ? parseYaml : JSON.parse,
        (error) => error,
      );

      const json = pipe(
        jsonify(source),
        either.chain(flow(configuration.decode, either.mapLeft(decoder.draw))),
        either.getOrElseW(notify),
      );

      const Component = () => (
        <StrictMode>
          <ThemeProvider theme={useTheme()}>
            <ApplicationProvider
              value={{
                fileName: (json.datasource as Record<'file', { path: string }>)
                  .file.path,
                vault: this.app.vault,
                schema: json.schema.inline,
                uischema: json.uischema?.inline as never,
              }}
            >
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
