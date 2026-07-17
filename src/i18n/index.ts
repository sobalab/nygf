import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'

export const LOCALE_STORAGE_KEY = 'nygf-locale'
export const supportedLocales = ['en', 'ko'] as const
export type Locale = (typeof supportedLocales)[number]

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return stored === 'en' || stored === 'ko' ? stored : 'en'
}

export function persistLocale(locale: Locale): void {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: readStoredLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
