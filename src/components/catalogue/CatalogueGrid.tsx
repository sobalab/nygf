import { useTranslation } from 'react-i18next'
import type { CatalogItem } from '../../types/catalog'
import { CatalogueCard } from './CatalogueCard'

interface CatalogueGridProps {
  items: CatalogItem[]
}

export function CatalogueGrid({ items }: CatalogueGridProps) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <p className="py-16 text-center font-sans text-sm text-faint">{t('catalogue.empty')}</p>
  }

  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <CatalogueCard key={item.id} item={item} />
      ))}
    </div>
  )
}
