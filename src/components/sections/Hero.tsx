import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { siteConfig } from '../../data/siteConfig'
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import { waHref } from '../../lib/links'
import { CtaButton } from '../common/CtaButton'
import { InteractiveStage, type StageMount } from '../stage/InteractiveStage'
import type { SketchControl } from '../stage/flowerSketch'

/**
 * Compact statement band — the page's weight sits with the availability
 * ledger and the gallery below, so this stays short and gets out of the way.
 */
export function Hero() {
  const { t } = useTranslation()
  const reducedMotion = usePrefersReducedMotion()
  const [paused, setPaused] = useState(false)
  // Live handle the sketch populates in setup(), so the pause button can drive it.
  const controlRef = useRef<SketchControl | null>(null)

  // Lazy-load p5 + the sketch only when the plate mounts (desktop, non-blocking):
  // dynamic import keeps p5 out of the initial bundle. useCallback keeps this
  // referentially stable so InteractiveStage's memo holds and the canvas never
  // remounts on language toggle or scroll.
  const mountFlower = useCallback<StageMount>(async (el, { reducedMotion, signal }) => {
    const [{ default: p5 }, { createFlowerSketch }] = await Promise.all([
      import('p5'),
      import('../stage/flowerSketch'),
    ])
    // Bail before creating p5 if we were torn down during the async import
    // (StrictMode double-invoke) — avoids an orphaned p5 canvas.
    if (signal.aborted) return
    const control: SketchControl = {}
    const instance = new p5(createFlowerSketch({ reducedMotion, container: el, control }), el)
    controlRef.current = control
    return () => {
      controlRef.current = null
      instance.remove()
    }
  }, [])

  // Push the pause state into the sketch when the user toggles it.
  useEffect(() => {
    controlRef.current?.setPaused?.(paused)
  }, [paused])

  return (
    <section id="home" className="relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.4fr_1fr] lg:py-16">
        <div className="flex flex-col gap-5">
          <span className="font-sans text-xs uppercase tracking-widest2 text-soft">{t('hero.eyebrow')}</span>
          <h1 className="font-display text-4xl leading-[1.12] text-ink sm:text-5xl">
            {t('hero.headlinePre')} <em className="not-italic text-sage-deep">{t('hero.headlineAccent')}</em>
          </h1>
          <p className="max-w-md font-sans text-base leading-relaxed text-soft">{t('hero.lede')}</p>

          <div className="mt-1 flex flex-wrap gap-4">
            <CtaButton href="#catalogue" variant="solid">
              {t('hero.ctaPrimary')}
            </CtaButton>
            <CtaButton href={waHref(siteConfig)} variant="outline">
              {t('hero.ctaSecondary')}
            </CtaButton>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-line-soft pt-4 font-sans text-xs uppercase tracking-widest2 text-faint">
            <li>{t('hero.metaSince', { year: siteConfig.establishedYear })}</li>
            <li>{t('hero.metaHours')}</li>
            <li>{t('hero.metaLocation')}</li>
          </ul>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[280px] lg:block">
          {/* Herbarium-style mounting corners — signals "specimen plate" without illustrating one. */}
          <span
            className="pointer-events-none absolute -left-2.5 -top-2.5 h-[18px] w-[18px] border-l border-t border-soft"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-2.5 -top-2.5 h-[18px] w-[18px] border-r border-t border-soft"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-2.5 -left-2.5 h-[18px] w-[18px] border-b border-l border-soft"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-2.5 -right-2.5 h-[18px] w-[18px] border-b border-r border-soft"
            aria-hidden="true"
          />
          {/* Generative botanical print — decorative; the hero's meaning is in the text. */}
          <div className="relative border border-line p-3" role="img" aria-label={t('hero.plateAlt')}>
            <InteractiveStage className="aspect-[4/5] w-full" mount={mountFlower} reducedMotion={reducedMotion} />
            {/* WCAG 2.2.2: an in-page control to stop the auto-playing motion. */}
            {reducedMotion ? null : (
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                aria-pressed={paused}
                aria-label={paused ? t('hero.playMotion') : t('hero.pauseMotion')}
                className="absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center bg-white/80 text-ink opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink"
              >
                {paused ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
                    <path d="M3 2l7 4-7 4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
                    <rect x="3" y="2" width="2.4" height="8" />
                    <rect x="6.6" y="2" width="2.4" height="8" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
