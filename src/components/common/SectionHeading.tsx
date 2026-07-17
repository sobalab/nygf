interface SectionHeadingProps {
  eyebrow?: string
  title: string
  lede?: string
  align?: 'left' | 'center'
  tone?: 'ink' | 'paper'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  tone = 'ink',
  className = '',
}: SectionHeadingProps) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  const eyebrowColor = tone === 'paper' ? 'text-paper-2/70' : 'text-soft'
  const titleColor = tone === 'paper' ? 'text-paper' : 'text-ink'
  const ledeColor = tone === 'paper' ? 'text-paper-2/80' : 'text-soft'

  return (
    <div className={`flex flex-col gap-3 ${alignCls} ${className}`}>
      {eyebrow ? (
        <span className={`font-sans text-xs uppercase tracking-widest2 ${eyebrowColor}`}>{eyebrow}</span>
      ) : null}
      <h2 className={`font-display text-4xl font-medium sm:text-5xl ${titleColor}`}>{title}</h2>
      {lede ? <p className={`max-w-xl font-sans text-base leading-relaxed ${ledeColor}`}>{lede}</p> : null}
    </div>
  )
}
