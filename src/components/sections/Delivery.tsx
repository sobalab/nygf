import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { openAccountMessage, waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { SectionHeading } from '../common/SectionHeading'

const INFO_KEYS = ['zones', 'coldChain', 'pickup'] as const
const STEPS = ['step1', 'step2', 'step3'] as const

export function Delivery() {
  const { t } = useTranslation()

  return (
    <section id="delivery" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t('delivery.eyebrow')} title={t('delivery.title')} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            {INFO_KEYS.map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <dt className="text-eyebrow text-plum">{t(`delivery.info.${key}.label`)}</dt>
                <dd className="max-w-md text-body-lg text-ink">{t(`delivery.info.${key}.value`)}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-sheet border border-line bg-white p-8 lg:p-10">
            <h3 className="font-display text-2xl text-ink">{t('delivery.account.title')}</h3>
            <div className="mt-6 flex flex-col gap-3">
              {STEPS.map((step) => (
                <p key={step} className="text-body-sm text-soft">
                  {t(`delivery.account.${step}`)}
                </p>
              ))}
            </div>
            <CtaButton href={waHref(siteConfig, openAccountMessage())} variant="solid" className="mt-8 w-full">
              {t('delivery.account.cta')}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
