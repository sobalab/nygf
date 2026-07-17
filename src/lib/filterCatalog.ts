import type { BlossomColor, CatalogItem, FlowerType, Season } from '../types/catalog'

export interface CatalogFilters {
  colors: BlossomColor[]
  types: FlowerType[]
  seasons: Season[]
}

export const emptyFilters: CatalogFilters = { colors: [], types: [], seasons: [] }

export function isFiltersEmpty(filters: CatalogFilters): boolean {
  return filters.colors.length === 0 && filters.types.length === 0 && filters.seasons.length === 0
}

/**
 * AND across the three groups (colour / type / season), OR within a group —
 * an empty group selection places no restriction on that group.
 */
export function filterCatalog(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  return items.filter((item) => {
    const colorMatch = filters.colors.length === 0 || item.colors.some((c) => filters.colors.includes(c))
    const typeMatch = filters.types.length === 0 || filters.types.includes(item.type)
    const seasonMatch = filters.seasons.length === 0 || item.season.some((s) => filters.seasons.includes(s))
    return colorMatch && typeMatch && seasonMatch
  })
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
