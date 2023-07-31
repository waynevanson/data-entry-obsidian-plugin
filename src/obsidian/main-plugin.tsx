import { Main } from '../ui';
import { App, Command, Plugin, parseYaml } from 'obsidian';
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandSource, Configuration } from '../common';

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
			// todo - create DIY code block processor that allows ```lang plugin
			this.registerMarkdownCodeBlockProcessor(
				`${extension}-${name}`,
				(source, element, context) => {
					const jsonify = yamls.includes(extension)
						? parseYaml
						: JSON.parse;

					const json = jsonify(source) as Configuration;
					const container = element.createEl('div');
					const root = createRoot(container);

					const handleSubmit = makeHandleSubmit(json, this.app);

					root.render(
						<StrictMode>
							<Main
								app={this.app}
								schema={json.forms.schema}
								uischema={json.forms.uischema}
								submit={json.submit}
								onSubmit={() => handleSubmit()}
							/>
						</StrictMode>,
					);
				},
			),
		);
	}
}

const makeHandleSubmit = (json: Configuration, app: App) => () => {
	const command: CommandSource | undefined =
		'command' in json.datasource ? json.datasource.command : undefined;

	const commandSet = command?.set
		? 'name' in command.set
			? getCommandByName(app, command.set.name)
			: 'id' in command.set
			? getCommandById(app, command.set.id)
			: undefined
		: undefined;

	if (!commandSet?.id) return;

	//@ts-expect-error
	app.commands.executeCommandById(commandSet.id);
};

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
