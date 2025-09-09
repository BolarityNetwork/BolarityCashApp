// hooks/usePersistedPrivyUser.ts
import { useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useUserStore } from './store/useUserStore';
import { router } from 'expo-router';

export function usePersistedPrivyUser() {
  const { user, isReady, logout: privyLogout } = usePrivy();
  const { cachedUser, hydrated, setCachedUser, setHydrated, clearUser } =
    useUserStore();

  const logout = useCallback(() => {
    privyLogout();
    clearUser();
    router.replace('/login');
  }, [privyLogout, clearUser]);

  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
    }
  }, [hydrated, setHydrated]);

  useEffect(() => {
    if (user) {
      setCachedUser(user);
    }
  }, [user, cachedUser, setCachedUser, clearUser]);

  return {
    isReady,
    hydrated,
    user: user || cachedUser,
    logout,
  };
}
