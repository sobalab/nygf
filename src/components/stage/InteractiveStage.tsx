import { memo, useEffect, useRef, useState } from 'react'

/** Mounts arbitrary imperative content (a canvas sketch) into the container. */
export type StageMount = (
  el: HTMLElement,
  opts: { reducedMotion: boolean; signal: AbortSignal },
) => (() => void) | void | Promise<(() => void) | void>

interface InteractiveStageProps {
  className?: string
  /** Tailwind background class for the plate (shows under/instead of a sketch). */
  background?: string
  /**
   * Imperative mount point for a p5/three sketch. Receives the container element
   * and the user's reduced-motion preference; returns a cleanup function. When
   * provided, the sketch owns the plate. When absent, the `fallbackSrc` image /
   * plain plate renders instead.
   */
  mount?: StageMount
  /**
   * The caller's reduced-motion preference, passed through to `mount`. Passed as
   * a prop (rather than read here) so a reactive hook can flip it live and this
   * effect re-runs — remounting the sketch in the new mode.
   */
  reducedMotion?: boolean
  fallbackSrc?: string
  fallbackAlt?: string
}

/**
 * The hero's framed "plate" and the designated mount point for a generative
 * sketch. Wrapped in React.memo so the sketch's render loop never re-runs on
 * page-level state changes (language toggle, scroll). Keep every prop passed to
 * it referentially stable (no translated strings, a useCallback'd `mount`) or
 * the memo breaks and the canvas remounts.
 */
function InteractiveStageBase({
  className = '',
  background = 'bg-paper-2',
  mount,
  reducedMotion = false,
  fallbackSrc,
  fallbackAlt = '',
}: InteractiveStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!mount || !el) return

    let cleanup: (() => void) | void
    let started = false
    const controller = new AbortController()

    // Lazy-mount on first intersection: the sketch (and the p5 download) only
    // start when the plate is actually on-screen. A hidden plate (mobile's
    // `hidden lg:block`) has zero size and never intersects, so nothing mounts
    // and p5 is never fetched there.
    const start = () => {
      if (started || controller.signal.aborted) return
      started = true
      // `mount` is async (lazy-imports p5). The signal lets it bail BEFORE
      // creating the sketch if we were torn down first — key for StrictMode's
      // mount→cleanup→mount and p5's deferred setup (which would otherwise leave
      // an orphan canvas). If it resolves after cleanup anyway, tear down at once.
      Promise.resolve(mount(el, { reducedMotion, signal: controller.signal }))
        .then((c) => {
          if (controller.signal.aborted) {
            c?.()
            return
          }
          cleanup = c
        })
        .catch((err) => {
          // e.g. a stale-deploy dynamic-import failure. Swallow so it isn't an
          // unhandled rejection; the plate is decorative and simply stays empty.
          if (import.meta.env.DEV) console.error('InteractiveStage mount failed', err)
        })
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start()
          io.disconnect()
        }
      },
      { rootMargin: '100px' },
    )
    io.observe(el)

    return () => {
      controller.abort()
      io.disconnect()
      cleanup?.()
    }
  }, [mount, reducedMotion])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${background} ${className}`}>
      {mount ? null : fallbackSrc && !imageFailed ? (
        <img
          src={fallbackSrc}
          alt={fallbackAlt}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="h-full w-full" aria-hidden="true" />
      )}
    </div>
  )
}

export const InteractiveStage = memo(InteractiveStageBase)
