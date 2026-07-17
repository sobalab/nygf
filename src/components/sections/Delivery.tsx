import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { openAccountMessage, waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { SectionHeading } from '../common/SectionHeading'

const INFO_KEYS = ['zones', 'cutoff', 'minimum', 'coldChain', 'pickup'] as const
const STEPS = ['step1', 'step2', 'step3'] as const

export function Delivery() {
  const { t } = useTranslation()

  return (
    <section id="delivery" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow={t('delivery.eyebrow')} title={t('delivery.title')} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <dl className="flex flex-col divide-y divide-line-soft border-y border-line-soft">
            {INFO_KEYS.map((key) => (
              <div
                key={key}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="font-sans text-xs uppercase tracking-widest2 text-faint">
                  {t(`delivery.info.${key}.label`)}
                </dt>
                <dd className="font-sans text-sm text-ink sm:text-right">{t(`delivery.info.${key}.value`)}</dd>
              </div>
            ))}
          </dl>

          <div className="border border-line p-8">
            <h3 className="font-display text-2xl text-ink">{t('delivery.account.title')}</h3>
            <ol className="mt-6 flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-display text-lg text-faint">{i + 1}</span>
                  <span className="font-sans text-sm text-soft">{t(`delivery.account.${step}`)}</span>
                </li>
              ))}
            </ol>
            <CtaButton href={waHref(siteConfig, openAccountMessage())} variant="solid" className="mt-8 w-full">
              {t('delivery.account.cta')}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
