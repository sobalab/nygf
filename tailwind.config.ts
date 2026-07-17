import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        'paper-2': 'var(--color-paper-2)',
        white: 'var(--color-white)',
        ink: 'var(--color-ink)',
        soft: 'var(--color-soft)',
        faint: 'var(--color-faint)',
        sage: 'var(--color-sage)',
        'sage-deep': 'var(--color-sage-deep)',
        line: 'var(--color-line)',
        'line-soft': 'var(--color-line-soft)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.22em',
      },
    },
  },
  plugins: [],
} satisfies Config
