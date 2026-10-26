/**
 * Keeps the user profile as a JSON file on the device (see `file-store.ts`).
 */

import { readText, removeFile, writeText } from '@/storage/file-store';
import type { UserProfile } from '@/types/user';
import { isUserProfile } from '@/utils/user-profile';

export const USER_FILE_NAME = 'user.json';

/** Returns `null` when there is no saved profile or the file content is not a valid profile. */
export async function loadUser(): Promise<UserProfile | null> {
  const text = await readText(USER_FILE_NAME);
  if (text === null) {
    return null;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  return isUserProfile(data) ? data : null;
}

export async function saveUser(profile: UserProfile): Promise<void> {
  await writeText(USER_FILE_NAME, JSON.stringify(profile));
}

export function deleteUser(): void {
  removeFile(USER_FILE_NAME);
}
