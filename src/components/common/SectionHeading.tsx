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
 * Devina display title, and an optional italic-serif lede. `tone="cream"`
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
    <div className={`flex flex-col gap-4 ${alignCls} ${className}`}>
      {eyebrow ? <span className={`text-eyebrow ${eyebrowColor}`}>{eyebrow}</span> : null}
      <h2 className={`font-display text-4xl font-normal leading-[1.05] sm:text-[3.25rem] ${titleColor}`}>{title}</h2>
      {lede ? (
        <p className={`max-w-xl font-accent text-lg leading-relaxed ${ledeColor} ${align === 'center' ? 'mx-auto' : ''}`}>
          {lede}
        </p>
      ) : null}
    </div>
  )
}
