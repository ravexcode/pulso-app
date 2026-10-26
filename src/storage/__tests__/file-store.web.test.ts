import { readText, removeFile, writeText } from '@/storage/file-store.web';

// The test environment has no `localStorage`, so a small in-memory one stands in for it.
const entries = new Map<string, string>();
const memoryStorage = {
  getItem: (key: string) => entries.get(key) ?? null,
  setItem: (key: string, value: string) => void entries.set(key, value),
  removeItem: (key: string) => void entries.delete(key),
};

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true });
});

beforeEach(() => {
  entries.clear();
});

describe('web file store', () => {
  it('returns null for a missing file', async () => {
    await expect(readText('user.json')).resolves.toBeNull();
  });

  it('writes, reads and removes a file under the app prefix', async () => {
    await writeText('user.json', '{"name":"Ana"}');

    expect(entries.get('pulso:user.json')).toBe('{"name":"Ana"}');
    await expect(readText('user.json')).resolves.toBe('{"name":"Ana"}');

    removeFile('user.json');

    await expect(readText('user.json')).resolves.toBeNull();
  });
});
