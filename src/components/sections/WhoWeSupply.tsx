import { useTranslation } from 'react-i18next'
import { SectionHeading } from '../common/SectionHeading'

const AUDIENCES = ['florists', 'events', 'hospitality', 'walkins'] as const

export function WhoWeSupply() {
  const { t } = useTranslation()

  return (
    <section id="who-we-supply" className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow={t('whoWeSupply.eyebrow')}
          title={t('whoWeSupply.title')}
          lede={t('whoWeSupply.lede')}
          tone="paper"
        />

        <div className="mt-16 grid gap-x-12 gap-y-16 sm:grid-cols-2">
          {AUDIENCES.map((key) => (
            <div key={key}>
              <h3 className="font-display text-2xl text-paper">{t(`whoWeSupply.audiences.${key}.title`)}</h3>
              <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-paper-2/75">
                {t(`whoWeSupply.audiences.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
