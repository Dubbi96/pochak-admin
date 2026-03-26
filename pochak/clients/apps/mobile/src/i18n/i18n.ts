import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ko from './locales/ko.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@pochak/language';

i18next.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

// Restore persisted language on startup
AsyncStorage.getItem(LANGUAGE_KEY).then(lang => {
  if (lang && (lang === 'ko' || lang === 'en')) {
    i18next.changeLanguage(lang);
  }
});

/** Change language and persist to AsyncStorage */
export async function changeLanguage(code: 'ko' | 'en') {
  await i18next.changeLanguage(code);
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
}

export { LANGUAGE_KEY };
export default i18next;
