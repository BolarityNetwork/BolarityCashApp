import React, { createContext, FC, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, vars } from 'nativewind';
import { View } from 'react-native';

import { LocalStorageEnum } from '@/lib/local-store';
import { ThemeColor } from '@/constants/ThemeColors';

export const ThemeContext = createContext<{
  themeColor: typeof ThemeColor.light;
  colorScheme: 'light' | 'dark';
}>({
  themeColor: {} as any,
  colorScheme: 'dark',
});

export const ThemeProvider: FC<{ children: any }> = ({ children }) => {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(
          LocalStorageEnum.ThemeMode
        );
        // TODO:
        // Supplementary logic savedMode sometimes is a string, sometimes is a object. eg: {"state":{"themeMode":"dark"},"version":0}
        if (savedMode) {
          let parsedMode = 'system';
          try {
            parsedMode = JSON.parse(savedMode)?.state?.themeMode || savedMode;
          } catch {
            parsedMode = savedMode;
          }

          setColorScheme(parsedMode as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  const themes = {
    light: vars(ThemeColor.light),
    dark: vars(ThemeColor.dark),
  };

  return (
    <ThemeContext.Provider
      value={{
        themeColor: ThemeColor[colorScheme || 'dark'],
        colorScheme: colorScheme || 'dark',
      }}
    >
      <View className="w-full h-full" style={themes[colorScheme || 'dark']}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};
