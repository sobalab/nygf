import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BLOSSOM_SWATCH } from '../../lib/blossomSwatches'
import type { CatalogFilters } from '../../lib/filterCatalog'
import {
  BLOSSOM_COLORS,
  FLOWER_TYPES,
  SEASONS,
  type BlossomColor,
  type FlowerType,
  type Season,
} from '../../types/catalog'

interface FilterBarProps {
  filters: CatalogFilters
  hasActiveFilters: boolean
  shownCount: number
  totalCount: number
  onToggleColor: (color: BlossomColor) => void
  onToggleType: (type: FlowerType) => void
  onToggleSeason: (season: Season) => void
  onClearAll: () => void
}

/**
 * Horizontal filter box above the gallery — label column left, toggles right,
 * one hairline-divided row per filter group, always visible on every
 * breakpoint. Replaces the old collapsible sidebar rail.
 */
export function FilterBar({
  filters,
  hasActiveFilters,
  shownCount,
  totalCount,
  onToggleColor,
  onToggleType,
  onToggleSeason,
  onClearAll,
}: FilterBarProps) {
  const { t } = useTranslation()

  return (
    <div className="border border-line" role="group" aria-label={t('catalogue.filters.title')}>
      <FilterRow label={t('catalogue.filters.colorLabel')}>
        {BLOSSOM_COLORS.map((color) => {
          const active = filters.colors.includes(color)
          return (
            <button
              key={color}
              type="button"
              onClick={() => onToggleColor(color)}
              aria-pressed={active}
              title={t(`catalogue.colors.${color}`)}
              className={`h-6 w-6 rounded-full border transition-shadow ${
                active ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'border-line'
              }`}
              style={{ background: BLOSSOM_SWATCH[color] }}
            >
              <span className="sr-only">{t(`catalogue.colors.${color}`)}</span>
            </button>
          )
        })}
      </FilterRow>

      <FilterRow label={t('catalogue.filters.typeLabel')}>
        {FLOWER_TYPES.map((type) => (
          <TogglePill key={type} active={filters.types.includes(type)} onClick={() => onToggleType(type)}>
            {t(`catalogue.types.${type}`)}
          </TogglePill>
        ))}
      </FilterRow>

      <FilterRow label={t('catalogue.filters.seasonLabel')}>
        {SEASONS.map((season) => (
          <TogglePill key={season} active={filters.seasons.includes(season)} onClick={() => onToggleSeason(season)}>
            {t(`catalogue.seasons.${season}`)}
          </TogglePill>
        ))}
      </FilterRow>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
          className="font-sans text-xs uppercase tracking-widest2 text-soft underline decoration-line-soft underline-offset-4 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-faint disabled:no-underline"
        >
          {t('catalogue.filters.clearAll')}
        </button>
        <span className="font-sans text-xs uppercase tracking-widest2 text-faint" role="status" aria-live="polite">
          {t('catalogue.filters.showing', { count: shownCount, total: totalCount })}
        </span>
      </div>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-soft px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
      <span className="w-44 shrink-0 font-sans text-xs uppercase tracking-widest2 text-faint">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1.5 font-sans text-xs uppercase tracking-widest2 transition-colors ${
        active ? 'border-ink bg-ink text-paper' : 'border-line text-soft hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
