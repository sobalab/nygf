import { useTranslation } from 'react-i18next'
import type { CatalogItem } from '../../types/catalog'
import { CatalogueCard } from './CatalogueCard'

interface CatalogueGridProps {
  items: CatalogItem[]
  total: number
}

export function CatalogueGrid({ items, total }: CatalogueGridProps) {
  const { t } = useTranslation()

  return (
    <div>
      <p className="mb-6 font-sans text-xs uppercase tracking-widest2 text-faint" role="status" aria-live="polite">
        {t('catalogue.filters.showing', { count: items.length, total })}
      </p>

      {items.length === 0 ? (
        <p className="py-16 text-center font-sans text-sm text-faint">{t('catalogue.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <CatalogueCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
