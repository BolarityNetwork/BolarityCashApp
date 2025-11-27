import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePersistedPrivyUser } from './usePersistedPrivyUser';
import { isBiometricEnabled } from '@/utils/biometrics';

export function useAppLock(appIsReady: boolean) {
  const { user } = usePersistedPrivyUser();
  const [locked, setLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasInitialCheck = useRef(false);
  const isUnlocked = useRef(false);

  useEffect(() => {
    const checkInitialLock = async () => {
      if (!appIsReady || hasInitialCheck.current || !user) {
        return;
      }

      hasInitialCheck.current = true;

      try {
        const enabled = await isBiometricEnabled();
        if (enabled) {
          setLocked(true);
        }
      } catch (error) {
        console.error('Error checking biometric on mount:', error);
      }
    };

    if (appIsReady && user) {
      checkInitialLock();
    }
  }, [appIsReady, user]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const previousState = appState.current;
      appState.current = nextAppState;

      if (
        previousState === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        isUnlocked.current = false;
        return;
      }

      if (
        previousState === 'background' &&
        nextAppState === 'active' &&
        user &&
        !isUnlocked.current
      ) {
        setLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  const handleUnlock = useCallback(() => {
    setLocked(false);
    isUnlocked.current = true;
  }, []);

  return {
    locked,
    onUnlock: handleUnlock,
  };
}
