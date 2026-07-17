import type { BilingualText } from './site'

export interface Origin {
  id: string
  /** Roman numeral shown in the Sourcing grid — I, II, III… */
  numeral: string
  country: BilingualText
  note?: BilingualText
}
