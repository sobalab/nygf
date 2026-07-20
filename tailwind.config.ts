import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens hold RGB channel triplets in :root so Tailwind can inject the
        // /opacity alpha via <alpha-value>.
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        'cream-2': 'rgb(var(--color-cream-2) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        mauve: 'rgb(var(--color-mauve) / <alpha-value>)',
        'mauve-deep': 'rgb(var(--color-mauve-deep) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        soft: 'rgb(var(--color-soft) / <alpha-value>)',
        faint: 'rgb(var(--color-faint) / <alpha-value>)',
        plum: 'rgb(var(--color-plum) / <alpha-value>)',
        'plum-deep': 'rgb(var(--color-plum-deep) / <alpha-value>)',
        petal: 'rgb(var(--color-petal) / <alpha-value>)',
        'petal-soft': 'rgb(var(--color-petal-soft) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        'line-soft': 'rgb(var(--color-line-soft) / <alpha-value>)',
        // Legacy aliases so any not-yet-touched reference still resolves.
        paper: 'rgb(var(--color-cream) / <alpha-value>)',
        'paper-2': 'rgb(var(--color-cream-2) / <alpha-value>)',
        sage: 'rgb(var(--color-plum) / <alpha-value>)',
        'sage-deep': 'rgb(var(--color-plum-deep) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Gambarino', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      // Sans (Manrope, variable 200–800) type scale — real weights available.
      // Each token bakes in its weight, leading, and tracking: UI chrome
      // (kickers/labels/buttons) on 500, body on 400, larger body on 300.
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1.1', letterSpacing: '0.06em', fontWeight: '500' }], // 12 — kickers
        meta: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }], // 13 — meta/values
        label: ['0.875rem', { lineHeight: '1.3', fontWeight: '500' }], // 14 — nav, cards, labels
        ui: ['0.875rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '500' }], // 14 — buttons, pills
        body: ['0.9375rem', { lineHeight: '1.65', fontWeight: '400' }], // 15 — body copy
        'body-lg': ['1.0625rem', { lineHeight: '1.6', fontWeight: '300' }], // 17 — larger body
      },
      borderRadius: {
        // Flat, minimal: a small consistent radius, nearly square.
        sheet: '4px', // panels, dropdowns
        tile: '4px', // catalogue tiles / cards
        btn: '4px', // buttons, controls
        chip: '2px', // tiny markers / badges
      },
      // Flat design — no shadows. Kept as no-op tokens so any lingering
      // shadow-* utility renders nothing rather than 404ing.
      boxShadow: {
        sheet: 'none',
        bloom: 'none',
        pill: 'none',
      },
    },
  },
  plugins: [],
} satisfies Config
