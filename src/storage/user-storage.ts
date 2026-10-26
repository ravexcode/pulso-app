/**
 * Keeps the user profile as a JSON file in the app's document directory. The file stays on
 * the device and the system does not clear it, but uninstalling the app removes it.
 */

import { File, Paths } from 'expo-file-system';

import type { UserProfile } from '@/types/user';
import { isUserProfile } from '@/utils/user-profile';

export const USER_FILE_NAME = 'user.json';

function getUserFile() {
  return new File(Paths.document, USER_FILE_NAME);
}

/** Returns `null` when there is no saved profile or the file content is not a valid profile. */
export async function loadUser(): Promise<UserProfile | null> {
  const file = getUserFile();
  if (!file.exists) {
    return null;
  }

  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    return null;
  }
  return isUserProfile(data) ? data : null;
}

export async function saveUser(profile: UserProfile): Promise<void> {
  const file = getUserFile();
  if (!file.exists) {
    file.create({ intermediates: true });
  }
  await file.write(JSON.stringify(profile));
}

export function deleteUser(): void {
  const file = getUserFile();
  if (file.exists) {
    file.delete();
  }
}
