import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface CtaButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'solid' | 'outline'
  children: ReactNode
}

/** Minimal outlined CTA used for tel:/wa.me/sms/mailto and in-page anchor links. */
export function CtaButton({ variant = 'outline', className = '', children, ...rest }: CtaButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 border px-6 py-3 font-sans text-xs uppercase tracking-widest2 transition-colors duration-200'
  const styles =
    variant === 'solid'
      ? 'border-ink bg-ink text-paper hover:border-sage-deep hover:bg-sage-deep'
      : 'border-ink text-ink hover:bg-ink hover:text-paper'

  return (
    <a className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </a>
  )
}
