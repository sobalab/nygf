import { useTranslation } from 'react-i18next'
import { SectionHeading } from '../common/SectionHeading'

const AUDIENCES = ['florists', 'events', 'hospitality', 'walkins'] as const

/** Deep-plum band — the page's one dark surface, for tonal rhythm between the
 *  cream sheets above and below. */
export function WhoWeSupply() {
  const { t } = useTranslation()

  return (
    <section id="who-we-supply" className="px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-sheet bg-plum-deep px-6 py-16 shadow-sheet sm:px-10 lg:px-14 lg:py-20">
        <SectionHeading
          eyebrow={t('whoWeSupply.eyebrow')}
          title={t('whoWeSupply.title')}
          lede={t('whoWeSupply.lede')}
          tone="cream"
        />

        <div className="mt-16 grid gap-x-14 gap-y-12 sm:grid-cols-2">
          {AUDIENCES.map((key) => (
            <div key={key}>
              <h3 className="font-display text-2xl text-cream">{t(`whoWeSupply.audiences.${key}.title`)}</h3>
              <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-cream/85">
                {t(`whoWeSupply.audiences.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
