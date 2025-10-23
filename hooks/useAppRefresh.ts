import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export default function useAppRefresh(onRefresh: () => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        onRefresh?.();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [onRefresh]);
}
