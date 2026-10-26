/**
 * Web version of `file-store.ts`. `expo-file-system` has no web support, so each "file" is a
 * `localStorage` entry. The data stays in this browser only.
 */

const KEY_PREFIX = 'pulso:';

/** Returns `null` when the file does not exist. */
export async function readText(name: string): Promise<string | null> {
  return localStorage.getItem(KEY_PREFIX + name);
}

export async function writeText(name: string, content: string): Promise<void> {
  localStorage.setItem(KEY_PREFIX + name, content);
}

export function removeFile(name: string): void {
  localStorage.removeItem(KEY_PREFIX + name);
}
