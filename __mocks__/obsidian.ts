import type { FileStats, EventRef } from 'obsidian';

declare module 'obsidian' {
  export interface EventRef {
    name: string;
    callback: (...data: Array<unknown>) => void;
  }
}

export class Events {
  constructor(
    private handlersByName = new Map<
      string,
      Array<(...data: Array<unknown>) => void>
    >(),
  ) {}

  on(
    name: string,
    callback: (...data: Array<unknown>) => void,
    ctx?: unknown,
  ): EventRef {
    const ref: EventRef = { name, callback };

    const handlers = this.handlersByName.has(name)
      ? this.handlersByName.get(name)!
      : this.handlersByName.set(name, []).get(name)!;

    handlers.push(callback);

    return ref;
  }

  off(name: string, callback: (...data: Array<unknown>) => void): void {
    if (!this.handlersByName.has(name)) return;
    const handlers = this.handlersByName.get(name)!;
    handlers
      .map((value, index) => ({ index, value }))
      .filter(({ value }) => Object.is(value, callback))
      .forEach(({ index }) => handlers.splice(index, 1));
  }

  offref(ref: EventRef): void {
    this.off(ref.name, ref.callback);
  }

  trigger(name: string, ...data: Array<unknown>): void {
    if (!this.handlersByName.has(name)) return;
    const handlers = this.handlersByName.get(name)!;
    handlers.forEach((callback) => callback(...data));
  }

  // tryTrigger(evt: EventRef, args: Array<unknown>): void {
  //   throw new Error();
  // }
}
