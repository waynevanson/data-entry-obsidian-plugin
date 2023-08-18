import 'obsidian';

declare module 'obsidian' {
  export interface EventRef {
    name: string;
    callback: (...data: Array<unknown>) => void;
  }
}
