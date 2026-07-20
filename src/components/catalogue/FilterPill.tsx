import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface FilterPillProps {
  label: string
  /** Number of active selections in this group — shown as a badge, and flips
   *  the pill to its filled state. */
  activeCount: number
  align?: 'left' | 'right'
  children: ReactNode
}

/**
 * A rounded filter pill that opens a soft popover panel. Filled plum when the
 * group has active selections, outlined otherwise. Closes on outside click or
 * Escape; keyboard and screen-reader wired via aria-expanded / aria-controls.
 */
export function FilterPill({ label, activeCount, align = 'left', children }: FilterPillProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const active = activeCount > 0

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`inline-flex items-center gap-2 rounded-pill border px-5 py-2.5 font-sans text-[11px] uppercase tracking-widest2 shadow-pill transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
          active
            ? 'border-plum-deep bg-plum-deep text-cream'
            : 'border-line bg-cream text-soft hover:border-plum/50 hover:text-ink'
        }`}
      >
        <span>{label}</span>
        {active ? (
          <span className="grid h-4 min-w-4 place-items-center rounded-pill bg-cream/25 px-1 text-[10px] leading-none text-cream">
            {activeCount}
          </span>
        ) : null}
        <svg
          viewBox="0 0 10 6"
          className={`h-1.5 w-2.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className={`absolute top-[calc(100%+10px)] z-30 min-w-[15rem] rounded-2xl border border-line bg-cream p-4 shadow-sheet ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
