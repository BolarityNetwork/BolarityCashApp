import { useEffect } from 'react';
import { AppState } from 'react-native';

export function useCheckForUpdates(checkForUpdates: () => Promise<boolean>) {
  useEffect(() => {
    checkForUpdates();

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        checkForUpdates();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForUpdates]);
}
