import type { BlossomColor } from '../types/catalog'

/** Muted, editorial swatch hexes for the filter rail — independent of the site's UI palette. */
export const BLOSSOM_SWATCH: Record<BlossomColor, string> = {
  white: '#FBFAF4',
  ivory: '#F1E9D8',
  blush: '#E9C9C9',
  pink: '#D99FB2',
  red: '#A23B3B',
  burgundy: '#5C2A2E',
  orange: '#C97A3D',
  yellow: '#D8B84A',
  lavender: '#B7A6CE',
  purple: '#6E4C7E',
  green: '#6E7A5A',
  mixed: 'conic-gradient(#A23B3B 0deg 90deg, #D8B84A 90deg 180deg, #6E7A5A 180deg 270deg, #B7A6CE 270deg 360deg)',
}
