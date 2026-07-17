export type AvailabilityStatus = 'in-stock' | 'limited' | 'pre-order'

export interface AvailabilityItem {
  name: string
  status: AvailabilityStatus
  /** Optional freeform note, e.g. "Ecuador, long stem". */
  detail?: string
}

export interface AvailabilityBoard {
  /** ISO date (YYYY-MM-DD) this cooler list applies to. */
  date: string
  /** ISO datetime the list was last updated — drives the "updated" timestamp. */
  updatedAt: string
  items: AvailabilityItem[]
}
