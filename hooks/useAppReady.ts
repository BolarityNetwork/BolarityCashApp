import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supportedLanguages, defaultLanguage, Language } from '@/i18n';
import i18n from '@/i18n';
import { usePersistedPrivyUser } from './usePersistedPrivyUser';
import * as SplashScreen from 'expo-splash-screen';

export function useAppReady() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const { isHydrated } = usePersistedPrivyUser();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        const deviceLocales = getLocales();
        if (
          savedLanguage &&
          supportedLanguages.some(lang => lang.code === savedLanguage)
        ) {
          await i18n.changeLanguage(savedLanguage);
          setLanguageLoaded(true);
          return;
        }

        const deviceLanguageCode = deviceLocales?.[0]?.languageCode;

        if (deviceLanguageCode?.toLowerCase().startsWith('zh')) {
          await i18n.changeLanguage(Language.CN);
        } else {
          await i18n.changeLanguage(defaultLanguage);
        }
      } catch (error) {
        console.warn('Failed to load language:', error);
        await i18n.changeLanguage(defaultLanguage);
      } finally {
        setLanguageLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  useEffect(() => {
    if (fontsLoaded && languageLoaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, languageLoaded, isHydrated]);

  return {
    appIsReady: fontsLoaded && languageLoaded && isHydrated,
    fontsLoaded,
    languageLoaded,
    isHydrated,
  };
}
