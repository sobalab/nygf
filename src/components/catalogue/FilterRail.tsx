import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BLOSSOM_SWATCH } from '../../lib/blossomSwatches'
import type { CatalogFilters } from '../../lib/filterCatalog'
import { BLOSSOM_COLORS, FLOWER_TYPES, SEASONS, type BlossomColor, type FlowerType, type Season } from '../../types/catalog'

interface FilterRailProps {
  filters: CatalogFilters
  hasActiveFilters: boolean
  onToggleColor: (color: BlossomColor) => void
  onToggleType: (type: FlowerType) => void
  onToggleSeason: (season: Season) => void
  onClearAll: () => void
}

export function FilterRail({
  filters,
  hasActiveFilters,
  onToggleColor,
  onToggleType,
  onToggleSeason,
  onClearAll,
}: FilterRailProps) {
  const { t } = useTranslation()
  const [railOpen, setRailOpen] = useState(false)

  const activeCount = filters.colors.length + filters.types.length + filters.seasons.length

  return (
    <aside aria-label={t('catalogue.filters.typeLabel')}>
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-between border border-line px-4 py-3 font-sans text-xs uppercase tracking-widest2 text-ink lg:hidden"
        aria-expanded={railOpen}
        aria-controls="catalogue-filter-panel"
        onClick={() => setRailOpen((open) => !open)}
      >
        <span>
          {t('catalogue.filters.typeLabel')}
          {activeCount > 0 ? ` (${activeCount})` : ''}
        </span>
        <span aria-hidden="true">{railOpen ? '−' : '+'}</span>
      </button>

      <div id="catalogue-filter-panel" className={`${railOpen ? 'flex' : 'hidden'} flex-col gap-8 lg:flex lg:sticky lg:top-24`}>
        <FilterGroup label={t('catalogue.filters.colorLabel')}>
          <div className="flex flex-wrap gap-3">
            {BLOSSOM_COLORS.map((color) => {
              const active = filters.colors.includes(color)
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onToggleColor(color)}
                  aria-pressed={active}
                  title={t(`catalogue.colors.${color}`)}
                  className={`h-6 w-6 rounded-full border transition-shadow ${active ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'border-line'}`}
                  style={{ background: BLOSSOM_SWATCH[color] }}
                >
                  <span className="sr-only">{t(`catalogue.colors.${color}`)}</span>
                </button>
              )
            })}
          </div>
        </FilterGroup>

        <FilterGroup label={t('catalogue.filters.typeLabel')}>
          <div className="flex flex-wrap gap-2">
            {FLOWER_TYPES.map((type) => (
              <TogglePill key={type} active={filters.types.includes(type)} onClick={() => onToggleType(type)}>
                {t(`catalogue.types.${type}`)}
              </TogglePill>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label={t('catalogue.filters.seasonLabel')}>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <TogglePill key={season} active={filters.seasons.includes(season)} onClick={() => onToggleSeason(season)}>
                {t(`catalogue.seasons.${season}`)}
              </TogglePill>
            ))}
          </div>
        </FilterGroup>

        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
          className="self-start font-sans text-xs uppercase tracking-widest2 text-soft underline decoration-line-soft underline-offset-4 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-faint disabled:no-underline"
        >
          {t('catalogue.filters.clearAll')}
        </button>
      </div>
    </aside>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-sans text-xs uppercase tracking-widest2 text-faint">{label}</h3>
      {children}
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
