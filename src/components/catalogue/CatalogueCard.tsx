import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { askPriceMessage, waHref } from '../../lib/links'
import type { CatalogItem } from '../../types/catalog'
import { PhotoFrame } from '../common/PhotoFrame'

interface CatalogueCardProps {
  item: CatalogItem
}

/**
 * Gallery card: the photo floats inset on a paper-2 cell, and all metadata
 * sits in a quiet row below the cell — name left, archive number right.
 */
export function CatalogueCard({ item }: CatalogueCardProps) {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'

  return (
    <article className="group flex flex-col">
      <div className="bg-paper-2 px-8 py-10 transition-colors duration-200 group-hover:bg-line-soft sm:px-10 sm:py-12">
        <PhotoFrame
          src={item.image}
          alt={item.name[locale]}
          latin={item.latin}
          className="mx-auto w-full max-w-[240px]"
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="font-sans text-sm font-medium leading-snug text-ink">{item.name[locale]}</h3>
        <span className="shrink-0 font-sans text-[10px] uppercase tracking-widest2 text-faint">
          N° {String(item.index).padStart(2, '0')}
        </span>
      </div>
      <p className="mt-1 font-sans text-xs text-faint">{item.latin}</p>
      <p className="font-sans text-xs uppercase tracking-widest2 text-soft">{item.soldBy[locale]}</p>

      <a
        href={waHref(siteConfig, askPriceMessage(item.name.en))}
        className="mt-2 inline-flex w-fit items-center gap-1 border-b border-sage-deep/40 font-sans text-xs uppercase tracking-widest2 text-sage-deep transition-colors hover:border-ink hover:text-ink"
      >
        {t('catalogue.askPrice')}
      </a>
    </article>
  )
}
