import { useTranslation } from 'react-i18next'
import { origins } from '../../data/origins'
import { siteConfig } from '../../data/siteConfig'
import { SectionHeading } from '../common/SectionHeading'

/**
 * Slim origin strip — one bordered row of six countries so it reads as
 * provenance metadata rather than competing with the gallery above.
 */
export function Sourcing() {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'

  return (
    <section id="sourcing" className="border-b border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <SectionHeading
          eyebrow={t('sourcing.eyebrow')}
          title={t('sourcing.title')}
          lede={t('sourcing.lede', { year: siteConfig.originsImportedSince })}
          align="center"
          className="mx-auto"
        />

        <div className="mt-10 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-6">
          {origins.map((origin) => (
            <div
              key={origin.id}
              className="flex flex-col items-center gap-2 border-b border-r border-line px-3 py-6 text-center"
            >
              <span className="font-sans text-sm tracking-widest2 text-faint">{origin.numeral}</span>
              <span className="font-sans text-xs uppercase tracking-widest2 text-ink">{origin.country[locale]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
