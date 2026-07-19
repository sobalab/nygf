import type { SiteConfig } from '../types/site'

// Owner-editable: business info and hours live here.
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
  hours: [
    { days: { en: 'Mon – Sat', ko: '월 – 토' }, hours: '6:00 AM – 2:00 PM' },
    { days: { en: 'Sunday', ko: '일요일' }, hours: '6:00 AM – 12:00 PM' },
  ],
  originsImportedSince: 1990,
}
