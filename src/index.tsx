// gui
import { App, Modal } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

export const ReactView = () => {
	return <p>Hello, React!</p>;
};

export class ExampleView extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const root = createRoot(this.contentEl);
		root.render(
			<React.StrictMode>
				<ReactView />
			</React.StrictMode>,
		);
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.contentEl);
	}
}
