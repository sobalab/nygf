import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { mailtoHref, smsHref, telHref, waHref } from '../../lib/links'

export function Footer() {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">{siteConfig.wordmark.line1}</span>
          <span className="font-sans text-[10px] uppercase tracking-widest2 text-soft">
            {siteConfig.wordmark.line2}
          </span>
          <p className="mt-4 max-w-[22ch] font-sans text-sm text-soft">{siteConfig.legalName}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-sans text-xs uppercase tracking-widest2 text-faint">{t('footer.contactTitle')}</h3>
          <a href={telHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-sage-deep">
            {t('footer.callLabel')}: {siteConfig.phone.display}
          </a>
          <a href={waHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-sage-deep">
            {t('footer.whatsappLabel')}: {siteConfig.cell.display}
          </a>
          <a href={smsHref(siteConfig)} className="font-sans text-sm text-ink transition-colors hover:text-sage-deep">
            {t('footer.textLabel')}: {siteConfig.cell.display}
          </a>
          <a
            href={mailtoHref(siteConfig)}
            className="font-sans text-sm text-ink transition-colors hover:text-sage-deep"
          >
            {t('footer.emailLabel')}: {siteConfig.email}
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-sans text-xs uppercase tracking-widest2 text-faint">{t('footer.addressTitle')}</h3>
          <p className="font-sans text-sm text-soft">
            {siteConfig.address.street}
            <br />
            {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-sans text-xs uppercase tracking-widest2 text-faint">{t('footer.hoursTitle')}</h3>
          <dl className="flex flex-col gap-1">
            {siteConfig.hours.map((row) => (
              <div key={row.days.en} className="flex justify-between gap-4 font-sans text-sm text-soft">
                <dt>{row.days[locale]}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-line px-6 py-6 text-center font-sans text-xs text-faint">
        {t('footer.rights', { year })}
      </div>
    </footer>
  )
}
