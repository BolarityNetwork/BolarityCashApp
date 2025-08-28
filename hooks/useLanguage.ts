import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supportedLanguages, defaultLanguage } from '@/i18n';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);

  // 初始化时从 AsyncStorage 获取保存的语言
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (
          savedLanguage &&
          supportedLanguages.some(lang => lang.code === savedLanguage)
        ) {
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.warn('Failed to load saved language:', error);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  // 切换语言
  const changeLanguage = async (languageCode: string) => {
    try {
      // 检查语言是否支持
      if (!supportedLanguages.some(lang => lang.code === languageCode)) {
        throw new Error(`Unsupported language: ${languageCode}`);
      }

      // 保存到 AsyncStorage
      await AsyncStorage.setItem('user-language', languageCode);

      // 更新 i18n 语言
      await i18n.changeLanguage(languageCode);

      // 更新本地状态
      setCurrentLanguage(languageCode);

      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  };

  // 获取当前语言信息
  const getCurrentLanguageInfo = () => {
    return (
      supportedLanguages.find(lang => lang.code === currentLanguage) ||
      supportedLanguages[0]
    );
  };

  // 获取所有支持的语言
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
