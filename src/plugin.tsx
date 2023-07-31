import { App, Command, Plugin, parseYaml } from 'obsidian';
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Configuration } from './common';
import { Main } from './ui';

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
					const file = this.app.vault
						.getFiles()
						.find(
							(file) => file.path === json.datasource.set.file,
						)!;
					const inputRaw = await this.app.vault.read(file);
					const inputJson: Array<unknown> = JSON.parse(inputRaw);

					const container = element.createEl('div');
					const root = createRoot(container);

					// Last index of the input, or null
					const selected =
						inputJson.length > 0 ? inputJson.length - 1 : null;

					root.render(
						<StrictMode>
							<Main
								data={inputJson}
								app={this.app}
								selected={selected}
								schema={json.forms.schema}
								uischema={json.forms.uischema}
								submit={json.submit}
								onSubmit={(outputJs) => {
									readPushSave(
										this.app,
										json.datasource.set.file,
										outputJs,
									);
								}}
							/>
						</StrictMode>,
					);
				},
			),
		);
	}
}

async function readPushSave(app: App, path: string, element: unknown) {
	const file = app.vault.getFiles().find((file) => file.path === path)!;

	const inputRaw = await app.vault.read(file);
	const inputJson: Array<unknown> = JSON.parse(inputRaw);
	inputJson.push(element);

	const outputJsonRaw = JSON.stringify(inputJson, null, 2);
	const outputJson = outputJsonRaw;
	app.vault.modify(file, outputJson);
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
