import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'

/**
 * Minimal brand strip at the top of the catalogue: a short statement, the calls
 * to action, and a single flat feature bloom. (The former 3D particle plate lives
 * on in src/components/stage/, unmounted.)
 */
export function Hero() {
  const { t } = useTranslation()

  return (
    <section id="home" className="scroll-mt-24 px-4 pb-6 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <span className="text-eyebrow text-plum">{t('hero.eyebrow')}</span>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-4xl leading-[1.06] text-ink sm:text-5xl">
              {t('hero.headlinePre')} <span className="text-plum">{t('hero.headlineAccent')}</span>
            </h1>
            <p className="max-w-md text-lg font-light leading-relaxed text-soft">{t('hero.lede')}</p>

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

          <figure className="mx-auto w-full max-w-[340px]">
            <div className="overflow-hidden rounded-tile ring-1 ring-inset ring-black/[0.04]">
              <img src="/images/flowers/rose.jpg" alt={t('hero.featureAlt')} className="aspect-[4/5] w-full object-cover" />
            </div>
            <figcaption className="mt-2 text-right text-sm text-faint">{t('hero.featureCaption')}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
