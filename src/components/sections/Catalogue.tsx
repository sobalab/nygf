import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalog } from '../../data/catalog'
import { emptyFilters, filterCatalog, isFiltersEmpty, toggleValue, type CatalogFilters } from '../../lib/filterCatalog'
import type { BlossomColor, FlowerType, Season } from '../../types/catalog'
import { CatalogueGrid } from '../catalogue/CatalogueGrid'
import { FilterBar } from '../catalogue/FilterBar'
import { SectionHeading } from '../common/SectionHeading'

const PAGE_SIZE = 8

export function Catalogue() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [prevFilters, setPrevFilters] = useState(filters)

  // Reset the reveal to the first page the moment filters change — done during
  // render (not in an effect) so the collapse happens in the same commit and no
  // extra tiles ever flash between paint and effect.
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setVisibleCount(PAGE_SIZE)
  }

  const filtered = useMemo(() => filterCatalog(catalog, filters), [filters])
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

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
    <section id="catalogue" className="scroll-mt-24 px-4 pb-16 pt-4 sm:px-6 sm:pb-24">
      <div className="mx-auto max-w-6xl rounded-sheet bg-cream px-5 py-12 shadow-sheet sm:px-10 lg:px-14 lg:py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow={t('catalogue.eyebrow')} title={t('catalogue.title')} />
          <p className="max-w-sm font-accent text-lg leading-relaxed text-soft md:text-right">{t('catalogue.lede')}</p>
        </div>

        <div className="mt-12">
          <FilterBar
            filters={filters}
            hasActiveFilters={!isFiltersEmpty(filters)}
            shownCount={filtered.length}
            totalCount={catalog.length}
            onToggleColor={toggleColor}
            onToggleType={toggleType}
            onToggleSeason={toggleSeason}
            onClearAll={clearAll}
          />
        </div>

        <div className="mt-12">
          <CatalogueGrid items={visible} hasMore={hasMore} onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)} />
        </div>
      </div>
    </section>
  )
}
