import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import {
  inquiryMailto,
  inquiryMessage,
  isFormServiceConfigured,
  mailtoHref,
  smsHref,
  telHref,
  waHref,
  type InquiryFields,
} from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { SectionHeading } from '../common/SectionHeading'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY = { name: '', business: '', phone: '', email: '', message: '' }

/**
 * The Contact page (its own hash route, #/contact). On submit it opens a
 * prefilled WhatsApp draft and — when a Web3Forms key is configured — auto-emails
 * a copy to the shop as the confirmation record. Without a key it degrades to
 * WhatsApp + a mailto copy so it never breaks.
 */
export function Contact() {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<Status>('idle')
  const [invalid, setInvalid] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)

  const configured = isFormServiceConfigured(siteConfig)
  const fields: InquiryFields = useMemo(
    () => ({
      name: form.name.trim(),
      business: form.business.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      message: form.message.trim(),
    }),
    [form],
  )
  const waUrl = waHref(siteConfig, inquiryMessage(fields))
  const mailtoUrl = inquiryMailto(siteConfig, fields)

  function update(key: keyof typeof EMPTY) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (honeypot.current?.value) return // bot
    if (!fields.name || !fields.phone || !fields.message) {
      setInvalid(true)
      return
    }
    setInvalid(false)

    // Open the WhatsApp draft inside the click gesture so it isn't popup-blocked.
    window.open(waUrl, '_blank', 'noopener,noreferrer')

    if (!configured) {
      setStatus('sent') // WhatsApp opened; the emailed copy is offered in the panel
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: siteConfig.web3formsAccessKey,
          subject: `Flower inquiry — ${fields.name}`,
          from_name: fields.name,
          replyto: fields.email,
          name: fields.name,
          business: fields.business ?? '',
          phone: fields.phone,
          email: fields.email ?? '',
          message: fields.message,
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  function reset() {
    setForm(EMPTY)
    setStatus('idle')
    setInvalid(false)
  }

  return (
    <section className="scroll-mt-24 px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <a href="#home" className="inline-flex items-center gap-1.5 text-ui text-plum transition-colors hover:text-plum-deep">
          <span aria-hidden="true">&larr;</span> {t('contactPage.back')}
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-sheet border border-line bg-white p-6 sm:p-10">
            <SectionHeading eyebrow={t('contactPage.eyebrow')} title={t('contactPage.title')} lede={t('contactPage.lede')} />

            {status === 'sent' ? (
              <div className="mt-10" role="status" aria-live="polite">
                <h3 className="font-display text-3xl text-ink">{t('contactPage.form.sentTitle')}</h3>
                <p className="mt-3 max-w-md text-body text-soft">
                  {configured ? t('contactPage.form.sentBody') : t('contactPage.form.sentBodyNoEmail')}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <CtaButton href={waUrl} target="_blank" rel="noopener noreferrer" variant="solid">
                    {t('contactPage.form.whatsappButton')}
                  </CtaButton>
                  {!configured ? (
                    <CtaButton href={mailtoUrl} variant="outline">
                      {t('contactPage.form.emailCopyButton')}
                    </CtaButton>
                  ) : null}
                  <button type="button" onClick={reset} className="text-ui text-plum underline decoration-plum/30 underline-offset-4 transition-colors hover:text-plum-deep">
                    {t('contactPage.form.again')}
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-10 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                {/* Honeypot — hidden from people, tempting to bots. */}
                <input
                  ref={honeypot}
                  type="text"
                  name="botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label={t('contactPage.form.nameLabel')} required>
                    <input id="name" type="text" required value={form.name} onChange={update('name')} className={inputCls} />
                  </Field>
                  <Field id="business" label={t('contactPage.form.businessLabel')} hint={t('contactPage.form.optional')}>
                    <input id="business" type="text" value={form.business} onChange={update('business')} className={inputCls} />
                  </Field>
                  <Field id="phone" label={t('contactPage.form.phoneLabel')} required>
                    <input id="phone" type="tel" required value={form.phone} onChange={update('phone')} className={inputCls} />
                  </Field>
                  <Field id="email" label={t('contactPage.form.emailLabel')} hint={t('contactPage.form.optional')}>
                    <input id="email" type="email" value={form.email} onChange={update('email')} className={inputCls} />
                  </Field>
                </div>

                <Field id="message" label={t('contactPage.form.messageLabel')} required>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={update('message')}
                    placeholder={t('contactPage.form.messagePlaceholder')}
                    className={`${inputCls} resize-y`}
                  />
                </Field>

                {invalid ? (
                  <p className="text-body-sm text-plum" role="alert">
                    {t('contactPage.form.invalid')}
                  </p>
                ) : null}
                {status === 'error' ? (
                  <p className="text-body-sm text-plum" role="alert">
                    {t('contactPage.form.error')}
                  </p>
                ) : null}

                <div className="mt-1">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center justify-center rounded-btn bg-plum-deep px-8 py-3.5 text-ui text-cream shadow-pill transition-colors duration-200 hover:bg-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60"
                  >
                    {status === 'sending' ? t('contactPage.form.sending') : t('contactPage.form.submit')}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="rounded-sheet border border-line bg-white p-6 sm:p-8">
            <h3 className="text-eyebrow text-plum">{t('contactPage.directTitle')}</h3>
            <div className="mt-5 flex flex-col gap-3">
              <ContactLink href={telHref(siteConfig)} label={t('footer.callLabel')} value={siteConfig.phone.display} />
              <ContactLink href={waHref(siteConfig)} label={t('footer.whatsappLabel')} value={siteConfig.cell.display} />
              <ContactLink href={smsHref(siteConfig)} label={t('footer.textLabel')} value={siteConfig.cell.display} />
              <ContactLink href={mailtoHref(siteConfig)} label={t('footer.emailLabel')} value={siteConfig.email} />
            </div>

            <h3 className="mt-8 text-eyebrow text-plum">{t('footer.addressTitle')}</h3>
            <p className="mt-3 text-body text-soft">
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
            </p>

            <h3 className="mt-8 text-eyebrow text-plum">{t('footer.hoursTitle')}</h3>
            <dl className="mt-3 flex flex-col gap-1.5">
              {siteConfig.hours.map((row) => (
                <div key={row.days.en} className="flex justify-between gap-4 text-body text-soft">
                  <dt>{row.days[locale]}</dt>
                  <dd className="text-ink">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

const inputCls =
  'w-full rounded-btn border border-line bg-cream px-4 py-2.5 text-body text-ink placeholder:text-faint transition-colors focus-visible:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/25'

function Field({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label text-ink">
        {label}
        {required ? <span className="text-plum"> *</span> : hint ? <span className="text-faint"> ({hint})</span> : null}
      </label>
      {children}
    </div>
  )
}

function ContactLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <a href={href} className="flex flex-col text-body text-ink transition-colors hover:text-plum">
      <span className="text-eyebrow text-faint">{label}</span>
      {value}
    </a>
  )
}
