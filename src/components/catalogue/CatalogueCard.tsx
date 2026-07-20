import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { askPriceMessage, waHref } from '../../lib/links'
import type { CatalogItem } from '../../types/catalog'
import { BloomTile } from './BloomTile'

interface CatalogueCardProps {
  item: CatalogItem
}

/**
 * Catalogue card: a flat colour (or photographic) tile with the name, Latin
 * name, and a quiet ask-price link beneath it.
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
        className="ring-1 ring-inset ring-black/[0.04]"
      />

      <h3 className="mt-3 text-label text-ink">{item.name[locale]}</h3>
      <p className="mt-0.5 text-sm text-faint">{item.latin}</p>

      <a
        href={waHref(siteConfig, askPriceMessage(item.name.en))}
        className="mt-2 inline-flex w-fit items-center gap-1.5 text-ui text-plum transition-colors hover:text-plum-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {t('catalogue.askPrice')}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
          &rarr;
        </span>
      </a>
    </article>
  )
}
