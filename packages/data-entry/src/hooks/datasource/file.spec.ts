import { rtl } from '../../test-utils';
import { createMocks } from '../../test-utils/mocks';
import { useFile, FileNotFoundError } from './file';

describe(useFile, () => {
  it('should be able to read the file from the vault', async () => {
    const file = {
      path: 'file.md',
      contents: 'Hello, World!',
    };
    const mocks = createMocks({
      vault: {
        root: {
          [file.path]: file.contents,
        },
      },
    });
    const hooked = rtl.renderHook(() => useFile(mocks.vault, file.path));
    await rtl.waitFor(() => {
      expect(hooked.result.current.data).toBe(file.contents);
      expect(hooked.result.current.error).toBeNull();
    });
  });

  it('should be show an error when the file does not exist', async () => {
    const file = {
      path: 'file.md',
      contents: 'Hello, World!',
    };
    const mocks = createMocks();
    const hooked = rtl.renderHook(() => useFile(mocks.vault, file.path));
    await rtl.waitFor(() => {
      expect(hooked.result.current.error).toBeInstanceOf(FileNotFoundError);
      expect(hooked.result.current.data).toBeNull();
    });
  });

  it('should be show an error when the file does not exist', async () => {
    const file = {
      path: 'file.md',
      contents: 'Hello, World!',
    };
    const mocks = createMocks();
    const hooked = rtl.renderHook(() => useFile(mocks.vault, file.path));
    await rtl.waitFor(() => {
      expect(hooked.result.current.error).toBeInstanceOf(FileNotFoundError);
      expect(hooked.result.current.data).toBeNull();
    });
  });

  it.todo('NotTFile');
  it.todo('FileRenamed');
});
