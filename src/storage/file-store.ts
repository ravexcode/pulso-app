/**
 * Small text files in the app's document directory. The files stay on the device and the
 * system does not clear them, but uninstalling the app removes them.
 * The web build uses `file-store.web.ts`, because `expo-file-system` has no web support.
 */

import { File, Paths } from 'expo-file-system';

function getFile(name: string) {
  return new File(Paths.document, name);
}

/** Returns `null` when the file does not exist. */
export async function readText(name: string): Promise<string | null> {
  const file = getFile(name);
  return file.exists ? file.text() : null;
}

export async function writeText(name: string, content: string): Promise<void> {
  const file = getFile(name);
  if (!file.exists) {
    file.create({ intermediates: true });
  }
  await file.write(content);
}

export function removeFile(name: string): void {
  const file = getFile(name);
  if (file.exists) {
    file.delete();
  }
}
