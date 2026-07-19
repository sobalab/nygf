import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { telHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { LanguageToggle } from '../common/LanguageToggle'

const NAV_ITEMS = [
  { key: 'catalogue', href: '#catalogue' },
  { key: 'sourcing', href: '#sourcing' },
  { key: 'delivery', href: '#delivery' },
  { key: 'contact', href: '#contact' },
] as const

export function Header() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="#home" className="flex items-center gap-3">
          <img src="/nygf-logo.svg" alt="" className="h-10 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-medium text-ink">{siteConfig.wordmark.line1}</span>
            <span className="font-sans text-[10px] uppercase tracking-widest2 text-soft">
              {siteConfig.wordmark.line2}
            </span>
          </span>
        </a>

        <nav
          className="hidden items-center gap-8 font-sans text-xs uppercase tracking-widest2 text-soft md:flex"
          aria-label={t('nav.catalogue')}
        >
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={item.href} className="transition-colors hover:text-ink">
              {t(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <LanguageToggle />
          <CtaButton href={telHref(siteConfig)} variant="outline">
            {t('common.callCta', { phone: siteConfig.phone.display })}
          </CtaButton>
        </div>

        <button
          type="button"
          className="font-sans text-xs uppercase tracking-widest2 text-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? t('common.menuClose') : t('common.menuOpen')}
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-line bg-paper px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4 font-sans text-sm uppercase tracking-widest2 text-soft">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="transition-colors hover:text-ink"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between gap-4">
            <LanguageToggle />
            <CtaButton href={telHref(siteConfig)} variant="solid">
              {t('common.callCta', { phone: siteConfig.phone.display })}
            </CtaButton>
          </div>
        </div>
      ) : null}
    </header>
  )
}
