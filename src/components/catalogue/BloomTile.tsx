import { useState } from 'react'
import { bloomFlat } from '../../lib/blossomSwatches'
import type { BlossomColor } from '../../types/catalog'

interface BloomTileProps {
  src: string
  alt: string
  latin: string
  colors: BlossomColor[]
  className?: string
}

/**
 * A catalogue cell. If a real photo exists at `src` it fills the frame; until
 * then it's a flat muted colour block keyed off the flower's blossom colour,
 * with the Latin name as a quiet placeholder label. Any dropped-in `.jpg`
 * silently replaces the block.
 */
export function BloomTile({ src, alt, latin, colors, className = '' }: BloomTileProps) {
  const [failed, setFailed] = useState(false)
  const primary = colors[0] ?? 'blush'

  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-tile ${className}`}>
      {!failed ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-4"
          style={{ backgroundColor: bloomFlat(primary) }}
          aria-hidden="true"
        >
          <span className="text-center text-xs text-ink/45">{latin}</span>
        </div>
      )}
    </div>
  )
}
