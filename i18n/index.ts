import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

export enum Language {
  CN = 'zh-CN',
  EN = 'en-US',
}

export const supportedLanguages = [
  { code: Language.EN, name: 'English' },
  { code: Language.CN, name: '中文' },
];

export const defaultLanguage = Language.EN;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-CN': { translation: zh },
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  debug: __DEV__,

  interpolation: {
    escapeValue: false,
  },

  ns: ['translation'],
  defaultNS: 'translation',

  pluralSeparator: '_',
  contextSeparator: '_',
});

export default i18n;
