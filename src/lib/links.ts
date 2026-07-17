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
