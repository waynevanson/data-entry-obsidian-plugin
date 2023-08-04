import 'obsidian';

declare module 'obsidian' {
	export interface App {
		emulateMobile(boolean: boolean): void;
		isMobile: boolean;
	}
}
