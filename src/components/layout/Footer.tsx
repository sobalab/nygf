import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { mailtoHref, smsHref, telHref, waHref } from '../../lib/links'

export function Footer() {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="scroll-mt-24 px-4 pb-10 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-sheet bg-cream px-6 py-14 shadow-sheet sm:px-10 lg:px-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <img src="/nygf-logo.svg" alt="" className="h-14 w-auto self-start" />
            <span className="mt-3 font-display text-lg text-ink">{siteConfig.wordmark.line1}</span>
            <span className="font-sans text-[9px] uppercase tracking-widest3 text-plum">
              {siteConfig.wordmark.line2}
            </span>
            <p className="mt-4 max-w-[22ch] font-accent text-sm text-soft">{siteConfig.legalName}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <h3 className="mb-1 font-sans text-[11px] uppercase tracking-widest2 text-faint">
              {t('footer.contactTitle')}
            </h3>
            <a href={telHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-plum">
              {t('footer.callLabel')}: {siteConfig.phone.display}
            </a>
            <a href={waHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-plum">
              {t('footer.whatsappLabel')}: {siteConfig.cell.display}
            </a>
            <a href={smsHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-plum">
              {t('footer.textLabel')}: {siteConfig.cell.display}
            </a>
            <a href={mailtoHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-plum">
              {t('footer.emailLabel')}: {siteConfig.email}
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="mb-1 font-sans text-[11px] uppercase tracking-widest2 text-faint">
              {t('footer.addressTitle')}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-soft">
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="mb-1 font-sans text-[11px] uppercase tracking-widest2 text-faint">
              {t('footer.hoursTitle')}
            </h3>
            <dl className="flex flex-col gap-1.5">
              {siteConfig.hours.map((row) => (
                <div key={row.days.en} className="flex justify-between gap-4 font-sans text-sm text-soft">
                  <dt>{row.days[locale]}</dt>
                  <dd className="text-ink">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <p className="mt-14 font-sans text-[11px] uppercase tracking-widest2 text-faint">
          {t('footer.rights', { year })}
        </p>
      </div>
    </footer>
  )
}
