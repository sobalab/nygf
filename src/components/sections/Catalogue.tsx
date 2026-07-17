import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalog } from '../../data/catalog'
import { emptyFilters, filterCatalog, isFiltersEmpty, toggleValue, type CatalogFilters } from '../../lib/filterCatalog'
import type { BlossomColor, FlowerType, Season } from '../../types/catalog'
import { CatalogueGrid } from '../catalogue/CatalogueGrid'
import { FilterRail } from '../catalogue/FilterRail'
import { SectionHeading } from '../common/SectionHeading'

export function Catalogue() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters)

  const filtered = useMemo(() => filterCatalog(catalog, filters), [filters])

  function toggleColor(color: BlossomColor) {
    setFilters((f) => ({ ...f, colors: toggleValue(f.colors, color) }))
  }
  function toggleType(type: FlowerType) {
    setFilters((f) => ({ ...f, types: toggleValue(f.types, type) }))
  }
  function toggleSeason(season: Season) {
    setFilters((f) => ({ ...f, seasons: toggleValue(f.seasons, season) }))
  }
  function clearAll() {
    setFilters(emptyFilters)
  }

  return (
    <section id="catalogue" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow={t('catalogue.eyebrow')} title={t('catalogue.title')} lede={t('catalogue.lede')} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr]">
          <FilterRail
            filters={filters}
            hasActiveFilters={!isFiltersEmpty(filters)}
            onToggleColor={toggleColor}
            onToggleType={toggleType}
            onToggleSeason={toggleSeason}
            onClearAll={clearAll}
          />
          <CatalogueGrid items={filtered} total={catalog.length} />
        </div>
      </div>
    </section>
  )
}
