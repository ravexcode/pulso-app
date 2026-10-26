import * as fileSystem from 'expo-file-system';
import { deleteUser, loadUser, saveUser, USER_FILE_NAME } from '@/storage/user-storage';
import { createUserProfile } from '@/utils/user-profile';

// Helpers from the in-memory mock in __mocks__/expo-file-system.ts.
const { __getFileContent, __resetFiles, __setFileContent } =
  fileSystem as unknown as typeof import('../../../__mocks__/expo-file-system');

const fileUri = `file:///document/${USER_FILE_NAME}`;

const profile = createUserProfile(
  {
    name: 'Leo',
    birthDate: '1995-09-30',
    sex: 'male',
    heightCm: 180,
    weightKg: 82,
    goal: 'lose-fat',
    level: 'intermediate',
    units: 'imperial',
    trainingDaysPerWeek: 3,
  },
  new Date('2026-10-25T12:00:00.000Z')
);

beforeEach(() => {
  __resetFiles();
});

describe('user storage', () => {
  it('returns null when there is no saved profile', async () => {
    await expect(loadUser()).resolves.toBeNull();
  });

  it('saves the profile as JSON in the document directory and loads it back', async () => {
    await saveUser(profile);

    expect(JSON.parse(__getFileContent(fileUri) ?? '')).toEqual(profile);
    await expect(loadUser()).resolves.toEqual(profile);
  });

  it('overwrites the previous profile', async () => {
    await saveUser(profile);
    await saveUser({ ...profile, weightKg: 80 });

    await expect(loadUser()).resolves.toEqual({ ...profile, weightKg: 80 });
  });

  it('returns null when the file is corrupted', async () => {
    __setFileContent(fileUri, '{ not json');

    await expect(loadUser()).resolves.toBeNull();
  });

  it('returns null when the file content is not a valid profile', async () => {
    __setFileContent(fileUri, JSON.stringify({ ...profile, heightCm: 'tall' }));

    await expect(loadUser()).resolves.toBeNull();
  });

  it('deletes the profile file', async () => {
    await saveUser(profile);

    deleteUser();

    expect(__getFileContent(fileUri)).toBeUndefined();
    await expect(loadUser()).resolves.toBeNull();
  });
});
