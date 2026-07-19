import { useTranslation } from 'react-i18next'
import { availability } from '../../data/availability'
import { siteConfig } from '../../data/siteConfig'
import type { AvailabilityStatus } from '../../types/availability'
import { coolerListMessage, waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { SectionHeading } from '../common/SectionHeading'

const STATUS_DOT: Record<AvailabilityStatus, string> = {
  'in-stock': 'bg-sage',
  limited: 'border border-soft bg-transparent',
  'pre-order': 'border border-faint bg-transparent',
}

export function AvailabilityBoard() {
  const { t, i18n } = useTranslation()
  const intlLocale = i18n.language === 'ko' ? 'ko-KR' : 'en-US'

  const dateLabel = new Intl.DateTimeFormat(intlLocale, { dateStyle: 'long' }).format(
    new Date(`${availability.date}T00:00:00`),
  )
  const updatedLabel = new Intl.DateTimeFormat(intlLocale, { timeStyle: 'short' }).format(
    new Date(availability.updatedAt),
  )

  return (
    <section id="cooler-today" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t('availability.eyebrow')} title={t('availability.title', { date: dateLabel })} />
          <div className="flex flex-col gap-1 font-sans text-xs uppercase tracking-widest2 text-faint sm:items-end">
            <span className="text-soft">{t('availability.summary', { count: availability.items.length })}</span>
            <span>{t('availability.updated', { time: updatedLabel })}</span>
          </div>
        </div>

        {/* Two-column ledger on wide screens; single dense column below. */}
        <ul className="mt-8 border-y border-line-soft py-2 lg:columns-2 lg:gap-x-16">
          {availability.items.map((item) => (
            <li
              key={item.name}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 break-inside-avoid border-b border-line-soft py-3 last:border-b-0"
            >
              <span
                className={`h-2 w-2 shrink-0 self-center rounded-full ${STATUS_DOT[item.status]}`}
                aria-hidden="true"
              />
              <span className="font-sans text-sm text-ink">{item.name}</span>
              {item.detail ? <span className="font-sans text-xs text-faint">({item.detail})</span> : null}
              {/* Ledger-style dot leader — hidden on narrow screens where there's no room for it to breathe. */}
              <span className="hidden h-0 flex-1 border-b border-dotted border-line sm:block" aria-hidden="true" />
              <span className="ml-auto font-sans text-xs uppercase tracking-widest2 text-soft sm:ml-0">
                {t(`availability.status.${item.status}`)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <CtaButton href={waHref(siteConfig, coolerListMessage(dateLabel))} variant="solid">
            {t('availability.sendListCta')}
          </CtaButton>
        </div>
      </div>
    </section>
  )
}
