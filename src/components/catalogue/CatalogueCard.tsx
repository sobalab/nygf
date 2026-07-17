import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { askPriceMessage, waHref } from '../../lib/links'
import type { CatalogItem } from '../../types/catalog'
import { PhotoFrame } from '../common/PhotoFrame'

interface CatalogueCardProps {
  item: CatalogItem
}

export function CatalogueCard({ item }: CatalogueCardProps) {
  const { t, i18n } = useTranslation()
  const locale: 'en' | 'ko' = i18n.language === 'ko' ? 'ko' : 'en'

  return (
    <article className="flex flex-col gap-3">
      <div className="relative">
        <PhotoFrame src={item.image} alt={item.name[locale]} latin={item.latin} />
        <span className="absolute right-2 top-2 rotate-3 bg-paper px-2 py-1 font-sans text-[10px] uppercase tracking-widest2 text-soft">
          N° {String(item.index).padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl leading-tight text-ink">{item.name[locale]}</h3>
        <p className="font-display text-sm italic text-faint">{item.latin}</p>
        <p className="font-sans text-xs uppercase tracking-widest2 text-soft">{item.soldBy[locale]}</p>
      </div>

      <a
        href={waHref(siteConfig, askPriceMessage(item.name.en))}
        className="mt-1 inline-flex w-fit items-center gap-1 border-b border-sage-deep/40 font-sans text-xs uppercase tracking-widest2 text-sage-deep transition-colors hover:border-ink hover:text-ink"
      >
        {t('catalogue.askPrice')}
      </a>
    </article>
  )
}
