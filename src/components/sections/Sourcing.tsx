import { useTranslation } from 'react-i18next'
import { origins } from '../../data/origins'
import { siteConfig } from '../../data/siteConfig'
import { SectionHeading } from '../common/SectionHeading'

/**
 * Provenance strip: six growing regions set as a quiet centred row, so it reads
 * as origin metadata rather than competing with the catalogue sheet above.
 */
export function Sourcing() {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'

  return (
    <section id="sourcing" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={t('sourcing.eyebrow')}
          title={t('sourcing.title')}
          lede={t('sourcing.lede', { year: siteConfig.originsImportedSince })}
          align="center"
          className="mx-auto"
        />

        <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {origins.map((origin) => (
            <li key={origin.id} className="flex flex-col items-center gap-2 text-center">
              <span className="font-accent text-2xl text-plum">{origin.numeral}</span>
              <span className="text-label text-ink">{origin.country[locale]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
