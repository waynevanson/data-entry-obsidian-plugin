import { rtl } from '../../test-utils';
import { createMocks } from '../../test-utils/mocks';
import { useFile } from './file';

describe(useFile, () => {
  // todo-fix with actual contents
  it('should be able to read the file from the vault', async () => {
    const file = {
      path: 'file.md',
      contents: 'Hello, World!',
    };
    const mocks = createMocks({
      vault: {
        [file.path]: file.contents,
      },
    });
    const hooked = rtl.renderHook(() => useFile(mocks.vault, file.path));
    await rtl.waitFor(() => {
      expect(hooked.result.current.data).toBe(file.contents);
      expect(hooked.result.current.error).toBeNull();
    });
  });
});
