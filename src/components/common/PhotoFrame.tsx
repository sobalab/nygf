import { useState } from 'react'

interface PhotoFrameProps {
  src: string
  alt: string
  latin: string
  className?: string
}

/**
 * Real-photo slot, ~4:5, object-fit cover. Until a photo exists at `src` the
 * image 404s and this swaps to a plain paper-toned placeholder naming the
 * Latin name — no illustrated line art.
 */
export function PhotoFrame({ src, alt, latin, className = '' }: PhotoFrameProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative aspect-[4/5] overflow-hidden bg-paper-2 ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-6 text-center">
          <span className="font-display text-base text-faint">{latin}</span>
        </div>
      )}
    </div>
  )
}
