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
  /**
   * Public Web3Forms access key (a UUID) for the contact form's auto-email to
   * the shop. Owner-set: sign up free at web3forms.com with the shop email and
   * paste the key here. Left as the placeholder, the form still works — it just
   * falls back to WhatsApp + a mailto copy instead of auto-sending.
   */
  web3formsAccessKey: string
}
