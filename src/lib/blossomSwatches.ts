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
  mixed: 'conic-gradient(#c88a95 0deg 90deg, #d8b84a 90deg 180deg, #8b976f 180deg 270deg, #b7a6ce 270deg 360deg)',
}

/**
 * Soft, three-tone wash per blossom colour, tuned light and editorial rather
 * than saturated. Used as the tinted fallback fill on a catalogue tile until a
 * real photo replaces it — so a rose reads warm-red, a hydrangea reads lilac,
 * and the grid looks like flowers even before the photography lands.
 */
const TILE_TONES: Record<BlossomColor, [string, string, string]> = {
  white: ['#fcf8f3', '#f3ece2', '#e6ddd0'],
  ivory: ['#f8f1e2', '#eee0c5', '#ddc9a4'],
  blush: ['#f9e7e4', '#eecacb', '#dba7ab'],
  pink: ['#f6dbe3', '#e6afc0', '#cf8ba6'],
  red: ['#eecac4', '#d68f88', '#a85049'],
  burgundy: ['#dcaeb2', '#a86a72', '#6d323d'],
  orange: ['#f7e2ca', '#e5b384', '#cc8149'],
  yellow: ['#f8efcd', '#e8d391', '#d0b055'],
  lavender: ['#eae0f0', '#cdbcdf', '#ab97c6'],
  purple: ['#e2d5ea', '#bda3ce', '#886692'],
  green: ['#e4e7d6', '#c3cca9', '#96a179'],
  mixed: ['#f4e6e0', '#dcc7c9', '#b79fb0'],
}

/** Composed CSS `background` for a tinted tile: a soft bloom top-left, a light
 *  pool lower-right, over the colour's three-tone wash. */
export function bloomTint(color: BlossomColor): string {
  const [from, via, to] = TILE_TONES[color] ?? TILE_TONES.blush
  return [
    'radial-gradient(58% 52% at 70% 80%, rgba(255,255,255,0.42), transparent 72%)',
    `radial-gradient(135% 125% at 30% 20%, ${from} 0%, ${via} 50%, ${to} 100%)`,
  ].join(', ')
}
