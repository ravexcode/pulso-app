import * as fileSystem from 'expo-file-system';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useUser } from '@/hooks/use-user';
import { UserProvider } from '@/providers/user-provider';
import { loadUser, saveUser } from '@/storage/user-storage';
import type { UserProfileInput } from '@/types/user';
import { createUserProfile, InvalidUserProfileError } from '@/utils/user-profile';

// Helpers from the in-memory mock in __mocks__/expo-file-system.ts.
const { __resetFiles } =
  fileSystem as unknown as typeof import('../../../__mocks__/expo-file-system');

const input: UserProfileInput = {
  name: 'Sara',
  birthDate: '2001-06-15',
  sex: 'female',
  heightCm: 160,
  weightKg: 55,
  goal: 'performance',
  level: 'advanced',
  units: 'metric',
  trainingDaysPerWeek: 5,
};

function renderUserHook() {
  return renderHook(() => useUser(), { wrapper: UserProvider });
}

beforeEach(() => {
  __resetFiles();
});

describe('UserProvider', () => {
  it('starts without a user when nothing is saved', async () => {
    const { result } = await renderUserHook();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('loads the saved profile from the device', async () => {
    const saved = createUserProfile(input);
    await saveUser(saved);

    const { result } = await renderUserHook();

    await waitFor(() => expect(result.current.user).toEqual(saved));
  });

  it('creates, updates and deletes the user on the device', async () => {
    const { result } = await renderUserHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.createUser(input));
    expect(result.current.user?.name).toBe('Sara');
    await expect(loadUser()).resolves.toEqual(result.current.user);

    await act(() => result.current.updateUser({ trainingDaysPerWeek: 6 }));
    expect(result.current.user?.trainingDaysPerWeek).toBe(6);
    await expect(loadUser()).resolves.toEqual(result.current.user);

    await act(() => result.current.deleteUser());
    expect(result.current.user).toBeNull();
    await expect(loadUser()).resolves.toBeNull();
  });

  it('does not save an invalid profile', async () => {
    const { result } = await renderUserHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.createUser({ ...input, name: '' })).rejects.toThrow(
      InvalidUserProfileError
    );
    await expect(loadUser()).resolves.toBeNull();
  });
});

describe('useUser', () => {
  it('throws outside UserProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(renderHook(() => useUser())).rejects.toThrow(
      'useUser must be used inside UserProvider'
    );
  });
});
