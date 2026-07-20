import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'

/**
 * Editorial floral hero: a soft out-of-focus bloom field bleeds across the top
 * of the page, and a cream panel floats over it holding the brand statement,
 * the calls to action, and a single feature bloom. (The former 3D particle
 * plate lives on in src/components/stage/, unmounted.)
 */
export function Hero() {
  const { t } = useTranslation()

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Full-bleed soft floral wash, fading down into the mauve page field. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]" aria-hidden="true">
        <div className="absolute inset-0 hero-bloom-field" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28">
        <div className="animate-rise-in rounded-sheet bg-cream/95 px-6 py-10 shadow-sheet backdrop-blur-sm sm:px-10 lg:px-14 lg:py-14">
          <span className="text-eyebrow text-plum">{t('hero.eyebrow')}</span>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-[2.5rem] leading-[1.05] text-ink sm:text-[3.5rem] lg:text-6xl">
                {t('hero.headlinePre')} <span className="text-plum">{t('hero.headlineAccent')}</span>
              </h1>
              <p className="max-w-md font-accent text-xl leading-relaxed text-soft">{t('hero.lede')}</p>

              <div className="mt-1 flex flex-wrap gap-3">
                <CtaButton href="#catalogue" variant="solid">
                  {t('hero.ctaPrimary')}
                </CtaButton>
                <CtaButton href={waHref(siteConfig)} variant="outline">
                  {t('hero.ctaSecondary')}
                </CtaButton>
              </div>

              <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-meta text-faint">
                <li>{t('hero.metaSince', { year: siteConfig.establishedYear })}</li>
                <li>{t('hero.metaHours')}</li>
                <li>{t('hero.metaLocation')}</li>
              </ul>
            </div>

            {/* Feature bloom — the one true photograph on the page. */}
            <figure className="relative mx-auto w-full max-w-[360px]">
              <div className="overflow-hidden rounded-sheet shadow-bloom">
                <img
                  src="/images/flowers/rose.jpg"
                  alt={t('hero.featureAlt')}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-right font-accent text-sm text-faint">{t('hero.featureCaption')}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
