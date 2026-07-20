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
      letterSpacing: {
        widest2: '0.22em',
        widest3: '0.32em',
      },
      borderRadius: {
        sheet: '28px',
        pill: '999px',
      },
      boxShadow: {
        sheet: '0 30px 80px -40px rgba(69, 42, 54, 0.45)',
        bloom: '0 18px 44px -28px rgba(69, 42, 54, 0.5)',
        pill: '0 1px 2px rgba(69, 42, 54, 0.08)',
      },
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
} satisfies Config
