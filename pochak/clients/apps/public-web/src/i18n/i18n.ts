import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'pochak-language';

const savedLang = localStorage.getItem(LANGUAGE_KEY);

i18next.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: savedLang && (savedLang === 'ko' || savedLang === 'en') ? savedLang : 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

/** Change language and persist to localStorage */
export function changeLanguage(code: 'ko' | 'en') {
  i18next.changeLanguage(code);
  localStorage.setItem(LANGUAGE_KEY, code);
}

export { LANGUAGE_KEY };
export default i18next;
