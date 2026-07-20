import type { BlossomColor } from '../types/catalog'

/** Small, saturated identifier dots for the colour filter. */
export const BLOSSOM_SWATCH: Record<BlossomColor, string> = {
  white: '#FBFAF4',
  ivory: '#EDE0C6',
  blush: '#E6C4C4',
  pink: '#D99FB2',
  red: '#B0554F',
  burgundy: '#6E3540',
  orange: '#C97A3D',
  yellow: '#D8B84A',
  lavender: '#B7A6CE',
  purple: '#8A6A9B',
  green: '#8B976F',
  mixed: '#C79BA0',
}

/**
 * Flat, muted fill per blossom colour — a single soft solid (no gradients), used
 * as the placeholder tile until a real photo drops in. Muted so the grid reads
 * calm and minimal, like flat colour blocks behind product shots.
 */
const BLOSSOM_FLAT: Record<BlossomColor, string> = {
  white: '#F1EEE9',
  ivory: '#EBE0CB',
  blush: '#EDD5D3',
  pink: '#E6BDCB',
  red: '#DCA69F',
  burgundy: '#C098A0',
  orange: '#E7BF98',
  yellow: '#EAD8A0',
  lavender: '#D6C9E1',
  purple: '#C6B2D3',
  green: '#CBD3B8',
  mixed: '#DFCACE',
}

/** The flat placeholder colour for a tile, keyed off the primary blossom colour. */
export function bloomFlat(color: BlossomColor): string {
  return BLOSSOM_FLAT[color] ?? BLOSSOM_FLAT.blush
}
