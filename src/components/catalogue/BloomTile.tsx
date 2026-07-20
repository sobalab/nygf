import { useState } from 'react'
import { bloomTint } from '../../lib/blossomSwatches'
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
 * then it falls back to a soft wash tinted by the flower's primary blossom
 * colour, with the Latin name set as a quiet botanical-plate label — so the
 * grid reads as flowers, not as missing images, and any dropped-in `.jpg`
 * silently replaces its tile.
 */
export function BloomTile({ src, alt, latin, colors, className = '' }: BloomTileProps) {
  const [failed, setFailed] = useState(false)
  const primary = colors[0] ?? 'blush'

  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-tile ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-5 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{ background: bloomTint(primary) }}
          aria-hidden="true"
        >
          {/* Seasonal cast, blended under the label so it warms/cools the tint. */}
          <span className="tile-season-cast" />
          {/* Full-opacity ink + a soft cream glow keeps the label legible over
              every tint (the same name is also printed below the tile). */}
          <span
            className="text-center font-accent text-base leading-snug text-plum-deep"
            style={{ textShadow: '0 0 14px rgba(253, 251, 247, 0.9)' }}
          >
            {latin}
          </span>
          {/* Soft inner vignette so the tile has depth, not a flat swatch. */}
          <span className="pointer-events-none absolute inset-0 rounded-tile shadow-[inset_0_0_60px_-20px_rgba(69,42,54,0.35)]" />
        </div>
      )}
    </div>
  )
}
