import type { DataAdapter } from 'obsidian';

export type FileConstructorParams = string | Partial<CacheItem>;

export type Item = FileConstructorParams | Directory;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Directory extends Record<string, Item> {}

export interface CacheItem {
  contents: string;
  ctime: number;
  mtime: number;
}

export function createDataAdapter(
  system: Directory,
): DataAdapter & { existsSync: (path: string) => boolean } {
  // todo - add time
  const now = Date.now();
  const cache: Record<string, CacheItem> = {};
  const split: Array<string> = [];

  const keys = ['contents', 'ctime', 'mtime'];
  const fn = (system: Directory) => {
    for (const property in system) {
      const path = ('/' + property).replace(/\/+/g, '/').slice(1);
      split.push(path);

      const contents = system[property];

      const key = split.join('/');
      if (typeof contents === 'string') {
        cache[key] = { contents, ctime: now, mtime: now };
      } else if (
        typeof contents === 'object' &&
        Object.keys(contents).some((key) => keys.includes(key))
      ) {
        // todo - fix the key so that we can name a file as "contents"
        cache[key] = { contents: '', ctime: now, mtime: now, ...contents };
      } else {
        // directory
        fn(contents as Directory);
      }

      split.pop();
    }
  };

  fn(system);

  const folders = (): Array<string> =>
    Object.keys(cache)
      .filter((path) => path.search('/') >= 0)
      .map((path) => {
        const index = path.lastIndexOf('/');
        return path.slice(0, index);
      })
      .concat('/');

  //@ts-expect-error
  return {
    append: async (path, data, _options) => {
      cache[path].contents += data;
    },
    trashSystem: async () => false,
    exists: async (path) => path in cache,
    existsSync: (path: string) => path in cache,
    read: async (path) => {
      if (path in cache) return cache[path].contents;
      else throw new Error(`${path} does not exist in the cache`);
    },
    write: async (path, data, _options) => {
      // todo - keep ctime/contents and modify mtime
      cache[path].contents = data;
    },
    stat: async (path) => {
      const item = cache[path];
      return {
        ctime: item.ctime,
        mtime: item.mtime,
        size: item.contents.length * 2,
        type: 'file',
      };
    },
    list: async () => ({ files: Object.keys(cache), folders: folders() }),
    process: async (path, f, _options) => {
      const contents = cache[path].contents;
      const next = f(contents);
      cache[path].contents = next;
      return next;
    },
    copy: async (current, next) => {
      if (next in cache) throw new Error(`"${next}" already exists as a file.`);
      // todo - keep ctime/contents and modify mtime
      cache[next] = cache[current];
    },
    remove: async (path) => {
      path in cache && delete cache[path];
    },
  };
}
