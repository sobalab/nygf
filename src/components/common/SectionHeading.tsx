interface SectionHeadingProps {
  eyebrow?: string
  title: string
  lede?: string
  align?: 'left' | 'center'
  tone?: 'ink' | 'cream'
  className?: string
}

/**
 * Section header: a small plum kicker (sentence case, no all-caps), a large
 * Gambarino display title, and an optional light lede. `tone="cream"`
 * inverts the colours for use on the deep plum band.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  tone = 'ink',
  className = '',
}: SectionHeadingProps) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  const eyebrowColor = tone === 'cream' ? 'text-petal' : 'text-plum'
  const titleColor = tone === 'cream' ? 'text-cream' : 'text-ink'
  const ledeColor = tone === 'cream' ? 'text-cream/90' : 'text-soft'

  return (
    <div className={`flex flex-col gap-3 ${alignCls} ${className}`}>
      {eyebrow ? <span className={`text-eyebrow ${eyebrowColor}`}>{eyebrow}</span> : null}
      <h2 className={`font-display text-3xl font-normal leading-[1.1] sm:text-4xl ${titleColor}`}>{title}</h2>
      {lede ? (
        <p className={`max-w-md text-base font-light leading-relaxed ${ledeColor} ${align === 'center' ? 'mx-auto' : ''}`}>
          {lede}
        </p>
      ) : null}
    </div>
  )
}
