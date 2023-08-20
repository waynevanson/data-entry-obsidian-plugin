import type { DataAdapter } from 'obsidian';

export type FileConstructorParams = string;

export type Item = FileConstructorParams | Directory;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Directory extends Record<string, Item> {}

export function createDataAdapter(
  system: Directory,
): DataAdapter & { existsSync: (path: string) => boolean } {
  // todo - add time
  const now = Date.now();
  const cache: Record<string, string> = {};
  const split: Array<string> = [];

  const fn = (system: Directory) => {
    for (const property in system) {
      const path = ('/' + property).replace(/\/+/g, '/').slice(1);
      split.push(path);

      const value = system[property];

      if (typeof value === 'string') {
        const key = split.join('/');
        cache[key] = value;
      } else {
        fn(value);
      }

      split.pop();
    }
  };

  fn(system);

  //@ts-expect-error
  return {
    append: async (path, data, _options) => {
      cache[path] += data;
    },
    exists: async (path) => path in cache,
    existsSync: (path: string) => path in cache,
    read: async (path) => {
      if (path in cache) return cache[path];
      else throw new Error(`${path} does not exist in the cache`);
    },
    write: async (path, data, _options) => {
      cache[path] = data;
    },
  };
}
