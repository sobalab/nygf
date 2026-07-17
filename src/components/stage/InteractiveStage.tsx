import { memo, useRef, useState } from 'react'

interface InteractiveStageProps {
  className?: string
  fallbackSrc?: string
  fallbackAlt?: string
}

/**
 * Designated mount point for a future three.js (@react-three/fiber) or p5.js
 * sketch — this is the hero's framed "plate". Wrapped in React.memo so a heavy
 * WebGL/canvas render loop mounted here later won't re-render on every
 * page-level state change (filters, language toggle, scroll, etc).
 *
 * For now it renders a static fallback: a real photo if `fallbackSrc` resolves,
 * otherwise a plain paper-toned block. No illustrated/SVG line art.
 */
function InteractiveStageBase({ className = '', fallbackSrc, fallbackAlt = '' }: InteractiveStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-paper-2 ${className}`}>
      {/*
        FUTURE CANVAS MOUNT POINT
        Swap this fallback for an R3F <Canvas> (three.js) or a p5 sketch bound
        to `containerRef.current`, e.g.:
          - three.js:  render <Canvas> as a child of this container
          - p5:        useEffect(() => { const s = new p5(sketch, containerRef.current); return () => s.remove() }, [])
        The sketch should own its own render loop / local state so it never
        forces a re-render of the surrounding page.
      */}
      {fallbackSrc && !imageFailed ? (
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
