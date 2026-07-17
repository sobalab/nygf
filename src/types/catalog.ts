import type { BilingualText } from './site'

export type BlossomColor =
  | 'white'
  | 'ivory'
  | 'blush'
  | 'pink'
  | 'red'
  | 'burgundy'
  | 'orange'
  | 'yellow'
  | 'lavender'
  | 'purple'
  | 'green'
  | 'mixed'

export type FlowerType =
  | 'rose'
  | 'garden-rose'
  | 'carnation'
  | 'lily'
  | 'hydrangea'
  | 'greens-foliage'
  | 'filler'
  | 'tropical'
  | 'seasonal'

export type Season = 'year-round' | 'spring' | 'summer' | 'fall' | 'winter'

export interface CatalogItem {
  id: string
  /** Display order + the rotated "N° 0X" archive index shown on the card. */
  index: number
  name: BilingualText
  latin: string
  soldBy: BilingualText
  /** TODO(owner): confirm colour tags per stem — placeholder set. */
  colors: BlossomColor[]
  type: FlowerType
  /** TODO(owner): confirm season tags — placeholder set. */
  season: Season[]
  /** Path under /public — swap the file to update the photo, no code change needed. */
  image: string
}
