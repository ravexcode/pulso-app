/**
 * In-memory replacement for `expo-file-system`, which needs the native module.
 * Jest uses it automatically in every test.
 */

const files = new Map<string, string>();

/** Removes every file. Call it in `beforeEach`. */
export function __resetFiles() {
  files.clear();
}

/** Sets the raw content of a file, for example to simulate a corrupted file. */
export function __setFileContent(uri: string, content: string) {
  files.set(uri, content);
}

export function __getFileContent(uri: string) {
  return files.get(uri);
}

class Directory {
  constructor(readonly uri: string) {}
}

export class File {
  readonly uri: string;

  constructor(...uris: (string | File | Directory)[]) {
    this.uri = uris.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
  }

  get exists() {
    return files.has(this.uri);
  }

  create() {
    files.set(this.uri, '');
  }

  async text() {
    const content = files.get(this.uri);
    if (content === undefined) {
      throw new Error(`File not found: ${this.uri}`);
    }
    return content;
  }

  async write(content: string) {
    files.set(this.uri, content);
  }

  delete() {
    files.delete(this.uri);
  }
}

export const Paths = {
  document: new Directory('file:///document'),
};
