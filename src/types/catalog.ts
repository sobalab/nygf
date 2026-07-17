import type { BilingualText } from './site'

export const BLOSSOM_COLORS = [
  'white',
  'ivory',
  'blush',
  'pink',
  'red',
  'burgundy',
  'orange',
  'yellow',
  'lavender',
  'purple',
  'green',
  'mixed',
] as const
export type BlossomColor = (typeof BLOSSOM_COLORS)[number]

export const FLOWER_TYPES = [
  'rose',
  'garden-rose',
  'carnation',
  'lily',
  'hydrangea',
  'greens-foliage',
  'filler',
  'tropical',
  'seasonal',
] as const
export type FlowerType = (typeof FLOWER_TYPES)[number]

export const SEASONS = ['year-round', 'spring', 'summer', 'fall', 'winter'] as const
export type Season = (typeof SEASONS)[number]

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
