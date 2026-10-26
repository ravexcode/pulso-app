import { useContext } from 'react';

import { UserContext } from '@/providers/user-provider';

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used inside UserProvider');
  }
  return context;
}
