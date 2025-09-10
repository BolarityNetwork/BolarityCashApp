import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言包
import en from './locales/en.json';
import zh from './locales/zh.json';

export enum Language {
  CN = 'zh-CN',
  EN = 'en-US',
}

// 支持的语言列表
export const supportedLanguages = [
  { code: Language.EN, name: 'English', flag: '🇺🇸' },
  { code: Language.CN, name: '中文', flag: '🇨🇳' },
];

// 默认语言
export const defaultLanguage = Language.EN;

// 初始化 i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      [Language.CN]: { translation: zh },
    },
    fallbackLng: defaultLanguage,
    debug: __DEV__, // 开发环境下启用调试

    interpolation: {
      escapeValue: false, // React 已经安全地转义了值
    },

    // 语言检测选项
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // 命名空间
    ns: ['translation'],
    defaultNS: 'translation',

    // 复数规则
    pluralSeparator: '_',
    contextSeparator: '_',
  });

export default i18n;
