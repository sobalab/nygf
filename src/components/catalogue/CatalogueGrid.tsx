import { useTranslation } from 'react-i18next'
import type { CatalogItem } from '../../types/catalog'
import { CatalogueCard } from './CatalogueCard'

interface CatalogueGridProps {
  /** The currently-revealed slice of the filtered catalogue. */
  items: CatalogItem[]
  hasMore: boolean
  onLoadMore: () => void
}

export function CatalogueGrid({ items, hasMore, onLoadMore }: CatalogueGridProps) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <div className="rounded-sheet border border-dashed border-line px-6 py-20 text-center">
        <p className="font-accent text-lg text-soft">{t('catalogue.empty')}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {items.map((item) => (
          <CatalogueCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-btn bg-plum-deep px-8 py-3.5 text-ui text-cream shadow-pill transition-colors duration-200 hover:bg-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            {t('catalogue.loadMore')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
