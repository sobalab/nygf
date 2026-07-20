import { useTranslation } from 'react-i18next'
import { SectionHeading } from '../common/SectionHeading'

const AUDIENCES = ['florists', 'events', 'hospitality', 'walkins'] as const

/** Flat, light block — a subtle surface shift from the page, no shadow. */
export function WhoWeSupply() {
  const { t } = useTranslation()

  return (
    <section id="who-we-supply" className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-sheet bg-cream-2 px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
        <SectionHeading eyebrow={t('whoWeSupply.eyebrow')} title={t('whoWeSupply.title')} lede={t('whoWeSupply.lede')} />

        <div className="mt-12 grid gap-x-14 gap-y-10 sm:grid-cols-2">
          {AUDIENCES.map((key) => (
            <div key={key}>
              <h3 className="font-display text-xl text-ink">{t(`whoWeSupply.audiences.${key}.title`)}</h3>
              <p className="mt-2 max-w-sm text-body-sm text-soft">{t(`whoWeSupply.audiences.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
