import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { InteractiveStage } from '../stage/InteractiveStage'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section id="home" className="relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
        <div className="flex flex-col gap-6">
          <span className="font-sans text-xs uppercase tracking-widest2 text-soft">{t('hero.eyebrow')}</span>
          <h1 className="font-display text-5xl font-medium leading-[1.08] text-ink sm:text-6xl">
            {t('hero.headlinePre')} <em className="text-sage-deep">{t('hero.headlineAccent')}</em>
          </h1>
          <p className="max-w-md font-sans text-base leading-relaxed text-soft">{t('hero.lede')}</p>

          <div className="mt-2 flex flex-wrap gap-4">
            <CtaButton href="#cooler-today" variant="solid">
              {t('hero.ctaPrimary')}
            </CtaButton>
            <CtaButton href={waHref(siteConfig)} variant="outline">
              {t('hero.ctaSecondary')}
            </CtaButton>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-line-soft pt-6 font-sans text-xs uppercase tracking-widest2 text-faint">
            <li>{t('hero.metaSince', { year: siteConfig.establishedYear })}</li>
            <li>{t('hero.metaHours')}</li>
            <li>{t('hero.metaLocation')}</li>
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="border border-line p-3">
            <InteractiveStage
              className="aspect-[4/5] w-full"
              fallbackSrc="/images/hero/plate.jpg"
              fallbackAlt={t('hero.eyebrow')}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
