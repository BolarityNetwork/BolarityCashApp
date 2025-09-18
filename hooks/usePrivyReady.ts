// hooks/usePrivyReady.ts
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { usePersistedPrivyUser } from './usePersistedPrivyUser';

export function usePrivyReady() {
  const { isHydrated } = usePersistedPrivyUser();

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  return {
    isHydrated,
  };
}
