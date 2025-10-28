import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supportedLanguages } from '@/i18n';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (
          savedLanguage &&
          supportedLanguages.some(lang => lang.code === savedLanguage)
        ) {
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.warn('Failed to load saved language:', error);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      if (!supportedLanguages.some(lang => lang.code === languageCode)) {
        throw new Error(`Unsupported language: ${languageCode}`);
      }

      await AsyncStorage.setItem('user-language', languageCode);

      await i18n.changeLanguage(languageCode);

      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  };

  const getCurrentLanguageInfo = () => {
    return (
      supportedLanguages.find(lang => lang.code === currentLanguage) ||
      supportedLanguages[0]
    );
  };

  const getSupportedLanguages = () => supportedLanguages;

  return {
    currentLanguage,
    currentLanguageInfo: getCurrentLanguageInfo(),
    supportedLanguages: getSupportedLanguages(),
    changeLanguage,
    isLanguageSupported: (languageCode: string) =>
      supportedLanguages.some(lang => lang.code === languageCode),
  };
};
