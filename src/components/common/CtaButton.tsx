import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface CtaButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  children: ReactNode
}

/** Rounded-rectangle CTA used for tel:/wa.me/sms/mailto and in-page anchors. */
export function CtaButton({ variant = 'outline', className = '', children, ...rest }: CtaButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn px-6 py-3 text-ui transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-cream'
  const styles =
    variant === 'solid'
      ? 'bg-plum-deep text-cream hover:bg-plum'
      : variant === 'ghost'
        ? 'text-plum-deep hover:text-plum'
        : 'border border-plum-deep/40 text-plum-deep hover:border-plum-deep hover:bg-plum-deep hover:text-cream'

  return (
    <a className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </a>
  )
}
