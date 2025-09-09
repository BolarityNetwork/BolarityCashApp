// hooks/usePersistedPrivyUser.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePrivy } from '@privy-io/expo';

const STORAGE_KEY = 'cached_user';

export function usePersistedPrivyUser() {
  const { user, isReady } = usePrivy();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          setCachedUser(JSON.parse(data));
        } catch {
          setCachedUser(null);
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (user) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setCachedUser(user);
    } else {
      setCachedUser(null);
    }
  }, [user]);

  return {
    isReady,
    hydrated,
    user: user || cachedUser,
  };
}
