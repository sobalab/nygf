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
        display: ['"Devina Garden"', 'serif'],
        accent: ['Feronia', 'Georgia', 'serif'],
        sans: ['Amiamie', 'sans-serif'],
      },
      // Sans (Amiamie) type scale. Amiamie ships only Light (300) and Regular
      // (400), so hierarchy is carried by size + colour, never faux-bold. Each
      // token bakes in its weight, leading, and tracking.
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1.1', letterSpacing: '0.06em', fontWeight: '400' }], // 12 — kickers
        meta: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }], // 13 — meta/values
        label: ['0.875rem', { lineHeight: '1.3', fontWeight: '400' }], // 14 — nav, cards, labels
        ui: ['0.875rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '400' }], // 14 — buttons, pills
        body: ['0.9375rem', { lineHeight: '1.65', fontWeight: '400' }], // 15 — body copy
        'body-lg': ['1.0625rem', { lineHeight: '1.6', fontWeight: '300' }], // 17 — larger body
      },
      borderRadius: {
        // One restrained rounded-rectangle scale.
        sheet: '14px', // section sheets, panels, photos, dropdowns
        tile: '10px', // catalogue tiles / cards
        btn: '8px', // buttons, pills, interactive rows
        chip: '5px', // tiny markers / badges
      },
      boxShadow: {
        sheet: '0 24px 70px -44px rgba(69, 42, 54, 0.42)',
        bloom: '0 16px 40px -28px rgba(69, 42, 54, 0.5)',
        pill: '0 1px 2px rgba(69, 42, 54, 0.06)',
      },
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
} satisfies Config
