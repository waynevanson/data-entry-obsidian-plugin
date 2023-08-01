import { App, Command, Plugin, parseYaml } from 'obsidian';
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Configuration } from './common';
import { Application } from './components';

export class MainPlugin extends Plugin {
	async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessors();
	}

	registerMarkdownCodeBlockProcessors(this: this) {
		const yamls = ['yaml', 'yml'];
		const jsons = ['json', 'jsn', 'jsonc'];
		const files = yamls.concat(...jsons);
		const name = 'data-entry';

		files.forEach((extension) =>
			// todo - create DIY code block processor that allows ```lang plugin-name
			this.registerMarkdownCodeBlockProcessor(
				`${extension}-${name}`,
				async (source, element, context) => {
					const jsonify = yamls.includes(extension)
						? parseYaml
						: JSON.parse;

					const json = jsonify(source) as Configuration;
					const container = element.createEl('div');
					const root = createRoot(container);

					root.render(
						<StrictMode>
							<Application
								fileName={json.datasource.file}
								app={this.app}
								schema={json.forms.schema}
								uischema={json.forms.uischema}
								submit={json.submit}
							/>
						</StrictMode>,
					);
				},
			),
		);
	}
}

const removeCodeFence = (string: string) =>
	/(?:```[a-z]*\n)[\s\S]*?(?:\n```)/g.exec(string)?.[0];

const addCodeFence = (string: string, format = '') =>
	[['```', format].join(''), string, '```'].join('\n');

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
