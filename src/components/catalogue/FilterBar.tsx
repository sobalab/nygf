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
import { FilterPill } from './FilterPill'

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
 * Pill filter row above the grid: one rounded dropdown per group (type, colour,
 * season), a live count, and a clear-all. Replaces the old bordered filter box.
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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-4" role="group" aria-label={t('catalogue.filters.title')}>
      <FilterPill label={t('catalogue.filters.typeLabel')} activeCount={filters.types.length}>
        <PanelHeading>{t('catalogue.filters.typeLabel')}</PanelHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {FLOWER_TYPES.map((type) => (
            <CheckRow
              key={type}
              active={filters.types.includes(type)}
              onClick={() => onToggleType(type)}
              label={t(`catalogue.types.${type}`)}
            />
          ))}
        </div>
      </FilterPill>

      <FilterPill label={t('catalogue.filters.pillColor')} activeCount={filters.colors.length}>
        <PanelHeading>{t('catalogue.filters.colorLabel')}</PanelHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {BLOSSOM_COLORS.map((color) => {
            const active = filters.colors.includes(color)
            return (
              <button
                key={color}
                type="button"
                onClick={() => onToggleColor(color)}
                aria-pressed={active}
                className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-cream-2 ${
                  active ? 'text-ink' : 'text-soft'
                }`}
              >
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border transition-shadow ${
                    active ? 'border-plum-deep ring-2 ring-plum-deep ring-offset-1 ring-offset-cream' : 'border-line'
                  }`}
                  style={{ background: BLOSSOM_SWATCH[color] }}
                  aria-hidden="true"
                />
                <span className="font-sans text-xs">{t(`catalogue.colors.${color}`)}</span>
              </button>
            )
          })}
        </div>
      </FilterPill>

      <FilterPill label={t('catalogue.filters.seasonLabel')} activeCount={filters.seasons.length}>
        <PanelHeading>{t('catalogue.filters.seasonLabel')}</PanelHeading>
        <div className="flex flex-col gap-1">
          {SEASONS.map((season) => (
            <CheckRow
              key={season}
              active={filters.seasons.includes(season)}
              onClick={() => onToggleSeason(season)}
              label={t(`catalogue.seasons.${season}`)}
            />
          ))}
        </div>
      </FilterPill>

      <div className="ml-auto flex items-center gap-4">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearAll}
            className="font-sans text-[11px] uppercase tracking-widest2 text-plum underline decoration-plum/30 underline-offset-4 transition-colors hover:text-plum-deep hover:decoration-plum-deep"
          >
            {t('catalogue.filters.clearAll')}
          </button>
        ) : null}
        <span className="font-sans text-[11px] uppercase tracking-widest2 text-faint" role="status" aria-live="polite">
          {t('catalogue.filters.showing', { count: shownCount, total: totalCount })}
        </span>
      </div>
    </div>
  )
}

function PanelHeading({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-sans text-[10px] uppercase tracking-widest2 text-faint">{children}</p>
}

function CheckRow({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-cream-2 ${
        active ? 'text-ink' : 'text-soft'
      }`}
    >
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition-colors ${
          active ? 'border-plum-deep bg-plum-deep text-cream' : 'border-line bg-cream'
        }`}
        aria-hidden="true"
      >
        {active ? (
          <svg viewBox="0 0 10 8" className="h-2 w-2.5 fill-none stroke-current" strokeWidth="1.8">
            <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span className="font-sans text-xs">{label}</span>
    </button>
  )
}
