import 'obsidian';

declare module 'obsidian' {
  export interface App {
    emulateMobile(boolean: boolean): void;
    isMobile: boolean;
  }

  export class YamlParseError extends Error {}
}
