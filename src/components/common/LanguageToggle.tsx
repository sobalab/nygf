import { useTranslation } from 'react-i18next'
import { persistLocale, type Locale } from '../../i18n'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const current: Locale = i18n.language === 'ko' ? 'ko' : 'en'

  function setLocale(locale: Locale) {
    void i18n.changeLanguage(locale)
    persistLocale(locale)
  }

  return (
    <div className="flex items-center gap-1 text-label" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={current === 'en'}
        className={`rounded-btn px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum ${
          current === 'en' ? 'text-ink' : 'text-soft hover:text-ink'
        }`}
      >
        EN
      </button>
      <span className="h-3 w-px bg-line" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLocale('ko')}
        aria-pressed={current === 'ko'}
        className={`rounded-btn px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum ${
          current === 'ko' ? 'text-ink' : 'text-soft hover:text-ink'
        }`}
      >
        KO
      </button>
    </div>
  )
}
