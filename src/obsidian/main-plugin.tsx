import { Main } from '../ui';
import { Plugin, parseYaml } from 'obsidian';
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Configuration } from '../common';

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
			this.registerMarkdownCodeBlockProcessor(
				`${extension}-${name}`,
				(source, element, context) => {
					const stringify = yamls.includes(extension)
						? parseYaml
						: JSON.parse;

					const json = stringify(source) as Configuration;
					const container = element.createEl('div');
					const root = createRoot(container);
					root.render(
						<StrictMode>
							<Main
								app={this.app}
								schema={json.forms.schema}
								uischema={json.forms.uischema}
							/>
						</StrictMode>,
					);
				},
			),
		);
	}
}
