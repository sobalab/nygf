import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { telHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { LanguageToggle } from '../common/LanguageToggle'

const NAV_ITEMS = [
  { key: 'catalogue', href: '#catalogue' },
  { key: 'sourcing', href: '#sourcing' },
  { key: 'delivery', href: '#delivery' },
  { key: 'contact', href: '#/contact' },
] as const

export function Header() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // A soft cream veil over the hero florals at the top (keeps header text above
  // AA contrast); a solid cream backdrop once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || menuOpen

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'border-b border-line bg-cream/90 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-cream/75 via-cream/35 to-transparent backdrop-blur-[2px]'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a href="#home" className="flex items-center gap-3">
          <img src="/nygf-logo.svg" alt="" className="h-9 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg text-ink">{siteConfig.wordmark.line1}</span>
            <span className="text-eyebrow text-plum">{siteConfig.wordmark.line2}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-9 text-label text-soft lg:flex" aria-label={t('nav.primary')}>
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={item.href} className="transition-colors hover:text-plum">
              {t(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageToggle />
          <CtaButton href={telHref(siteConfig)} variant="outline">
            {t('common.callCta', { phone: siteConfig.phone.display })}
          </CtaButton>
        </div>

        <button
          type="button"
          className="text-label text-ink lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? t('common.menuClose') : t('common.menuOpen')}
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-line bg-cream px-4 py-6 sm:px-6 lg:hidden">
          <nav className="flex flex-col gap-4 text-label text-soft" aria-label={t('nav.primary')}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="transition-colors hover:text-plum"
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
