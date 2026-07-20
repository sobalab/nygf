import type { SiteConfig } from '../types/site'

export function telHref(config: SiteConfig): string {
  return `tel:${config.phone.tel}`
}

export function smsHref(config: SiteConfig): string {
  return `sms:${config.cell.sms}`
}

export function mailtoHref(config: SiteConfig): string {
  return `mailto:${config.email}`
}

/** wa.me deep link, optionally pre-filling the message body. */
export function waHref(config: SiteConfig, message?: string): string {
  const base = `https://wa.me/${config.cell.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function askPriceMessage(itemNameEn: string): string {
  return `Hi, I'd like today's price on ${itemNameEn}.`
}

export function coolerListMessage(dateLabel: string): string {
  return `Hi, could you send me today's cooler list (${dateLabel})?`
}

export function openAccountMessage(): string {
  return "Hi, I'd like to open a wholesale account."
}

export interface InquiryFields {
  name: string
  business?: string
  phone?: string
  email?: string
  message: string
}

/** The composed inquiry body shared by the WhatsApp draft and the email copy. */
export function inquiryMessage(f: InquiryFields): string {
  return [
    `Flower inquiry — ${f.name}`,
    f.business ? `Business: ${f.business}` : null,
    f.phone ? `Phone: ${f.phone}` : null,
    f.email ? `Email: ${f.email}` : null,
    '',
    f.message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
}

/** mailto: draft to the shop, prefilled with the inquiry — the fallback email copy. */
export function inquiryMailto(config: SiteConfig, f: InquiryFields): string {
  const subject = `Flower inquiry — ${f.name}`
  return `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiryMessage(f))}`
}

/** Whether the contact form can auto-email via Web3Forms (a real key is set). */
export function isFormServiceConfigured(config: SiteConfig): boolean {
  const key = config.web3formsAccessKey
  return Boolean(key) && key !== 'YOUR_WEB3FORMS_ACCESS_KEY'
}
