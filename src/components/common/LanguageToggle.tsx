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
    <div
      className="flex items-center gap-1 font-sans text-xs uppercase tracking-widest2"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={current === 'en'}
        className={`px-2 py-1 transition-colors ${current === 'en' ? 'text-ink' : 'text-faint hover:text-ink'}`}
      >
        EN
      </button>
      <span className="h-3 w-px bg-line" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLocale('ko')}
        aria-pressed={current === 'ko'}
        className={`px-2 py-1 transition-colors ${current === 'ko' ? 'text-ink' : 'text-faint hover:text-ink'}`}
      >
        KO
      </button>
    </div>
  )
}
