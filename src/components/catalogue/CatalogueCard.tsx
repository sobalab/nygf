import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { askPriceMessage, waHref } from '../../lib/links'
import type { CatalogItem } from '../../types/catalog'
import { BloomTile } from './BloomTile'

interface CatalogueCardProps {
  item: CatalogItem
}

/**
 * Catalogue card: a tinted (or photographic) bloom tile with the name set in
 * tracked small-caps beneath it, the Latin name in italic, and a quiet
 * ask-price link that warms on hover.
 */
export function CatalogueCard({ item }: CatalogueCardProps) {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'

  return (
    <article className="group flex flex-col">
      <BloomTile
        src={item.image}
        alt={item.name[locale]}
        latin={item.latin}
        colors={item.colors}
        className="shadow-bloom ring-1 ring-inset ring-black/[0.03]"
      />

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-sans text-xs uppercase tracking-widest2 text-ink">{item.name[locale]}</h3>
        <span className="mt-0.5 shrink-0 font-sans text-[10px] tracking-widest2 text-faint">
          N°{String(item.index).padStart(2, '0')}
        </span>
      </div>
      <p className="mt-1 font-accent text-sm text-faint">{item.latin}</p>

      <a
        href={waHref(siteConfig, askPriceMessage(item.name.en))}
        className="mt-3 inline-flex w-fit items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest2 text-plum transition-colors hover:text-plum-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {t('catalogue.askPrice')}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
          &rarr;
        </span>
      </a>
    </article>
  )
}
