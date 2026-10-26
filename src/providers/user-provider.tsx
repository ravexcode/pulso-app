import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as userStorage from '@/storage/user-storage';
import type { UserProfile, UserProfileInput } from '@/types/user';
import { createUserProfile, updateUserProfile } from '@/utils/user-profile';

export type UserContextValue = {
  /** `null` until the user creates a profile. */
  user: UserProfile | null;
  /** `true` while the profile is read from the device. */
  isLoading: boolean;
  createUser: (input: UserProfileInput) => Promise<UserProfile>;
  updateUser: (changes: Partial<UserProfileInput>) => Promise<UserProfile>;
  deleteUser: () => void;
};

export const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    void userStorage
      .loadUser()
      .catch((error: unknown) => {
        console.warn('Could not read the user profile', error);
        return null;
      })
      .then((profile) => {
        if (isActive) {
          setUser(profile);
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const createUser = useCallback(async (input: UserProfileInput) => {
    const profile = createUserProfile(input);
    await userStorage.saveUser(profile);
    setUser(profile);
    return profile;
  }, []);

  const updateUser = useCallback(
    async (changes: Partial<UserProfileInput>) => {
      if (!user) {
        throw new Error('There is no user profile to update');
      }
      const profile = updateUserProfile(user, changes);
      await userStorage.saveUser(profile);
      setUser(profile);
      return profile;
    },
    [user]
  );

  const deleteUser = useCallback(() => {
    userStorage.deleteUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, createUser, updateUser, deleteUser }),
    [user, isLoading, createUser, updateUser, deleteUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
