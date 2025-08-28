import { useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { ThemeContext } from '@/components/theme/ThemeContext';
import { LocalStorageEnum } from '@/lib/local-store';

export const useTheme = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { themeColor } = useContext(ThemeContext);

  const toggleTheme = useCallback(async () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme);

    try {
      await AsyncStorage.setItem(LocalStorageEnum.ThemeMode, newTheme);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, [colorScheme, setColorScheme]);

  const setTheme = useCallback(
    async (theme: 'light' | 'dark' | 'system') => {
      setColorScheme(theme);

      try {
        await AsyncStorage.setItem(LocalStorageEnum.ThemeMode, theme);
      } catch (error) {
        console.error('Failed to save theme mode:', error);
      }
    },
    [setColorScheme]
  );

  return {
    colorScheme,
    themeColor,
    toggleTheme,
    setTheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
};
