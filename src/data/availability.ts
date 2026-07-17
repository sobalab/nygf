import type { AvailabilityBoard } from '../types/availability'

// Owner-editable: edit this file each morning. `date` is the cooler date shown
// in the heading, `updatedAt` drives the "updated" timestamp, and each item's
// `status` is one of 'in-stock' | 'limited' | 'pre-order'.
// TODO(owner): this is placeholder content — replace with the real daily list.
export const availability: AvailabilityBoard = {
  date: '2026-07-17',
  updatedAt: '2026-07-17T06:45:00-04:00',
  items: [
    { name: "Rose 'Freedom', red", status: 'in-stock' },
    { name: "Spray Rose 'Playa Blanca'", status: 'in-stock' },
    { name: "Garden Rose 'Keira'", status: 'limited', detail: 'Ecuador, short crop this week' },
    { name: 'Standard Carnation, red & white', status: 'in-stock' },
    { name: "Oriental Lily 'Stargazer'", status: 'in-stock' },
    { name: 'Hydrangea, white', status: 'limited' },
    { name: 'Peony', status: 'pre-order', detail: 'Next delivery Thursday' },
    { name: 'Eucalyptus', status: 'in-stock' },
    { name: "Baby's Breath", status: 'in-stock' },
    { name: 'Ranunculus, mixed', status: 'pre-order' },
  ],
}
