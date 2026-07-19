export interface BilingualText {
  en: string
  ko: string
}

export interface HoursRow {
  /** e.g. "Mon – Fri" — owner-editable, see data/siteConfig.ts */
  days: BilingualText
  hours: string
}

export interface SiteConfig {
  legalName: string
  wordmark: {
    line1: string
    line2: string
  }
  establishedYear: number
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  /** Store landline — voice calls only. */
  phone: {
    display: string
    tel: string
  }
  /** Owner's cell — WhatsApp + SMS, the primary contact channels. */
  cell: {
    display: string
    whatsapp: string
    sms: string
  }
  email: string
  hours: HoursRow[]
  originsImportedSince: number
}
