import type { SiteConfig } from '../types/site'

// Owner-editable: hours are a placeholder until confirmed — update the `hours`
// array below with real open/close times per day.
export const siteConfig: SiteConfig = {
  legalName: 'New York Garden Flower Wholesale, Inc.',
  wordmark: {
    line1: 'New York Garden',
    line2: 'Flower Wholesale',
  },
  establishedYear: 1990,
  address: {
    street: '171-10 39th Ave',
    city: 'Flushing',
    state: 'NY',
    zip: '11358',
  },
  phone: {
    display: '718-886-1190',
    tel: '+17188861190',
  },
  cell: {
    display: '201-815-1040',
    whatsapp: '12018151040',
    sms: '+12018151040',
  },
  email: 'nyflowergarden@hotmail.com',
  // TODO(owner): confirm real hours — placeholder, not yet reviewed.
  hours: [
    { days: { en: 'Mon – Fri', ko: '월 – 금' }, hours: '6:00 AM – 4:00 PM' },
    { days: { en: 'Saturday', ko: '토요일' }, hours: '7:00 AM – 2:00 PM' },
    { days: { en: 'Sunday', ko: '일요일' }, hours: 'Closed' },
  ],
  originsImportedSince: 1990,
}
