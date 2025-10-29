// hooks/useAppReady.ts
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supportedLanguages, defaultLanguage } from '@/i18n';
import i18n from '@/i18n';

export function useAppReady() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (
          savedLanguage &&
          supportedLanguages.some(lang => lang.code === savedLanguage)
        ) {
          await i18n.changeLanguage(savedLanguage);
        } else {
          await i18n.changeLanguage(defaultLanguage);
        }
      } catch (error) {
        console.warn('Failed to load saved language:', error);
        await i18n.changeLanguage(defaultLanguage);
      } finally {
        setLanguageLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  useEffect(() => {
    if (fontsLoaded && languageLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, languageLoaded]);

  return {
    appIsReady: fontsLoaded && languageLoaded,
    fontsLoaded,
    languageLoaded,
  };
}
