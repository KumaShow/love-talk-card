import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['ui-serif', 'Georgia', "'Times New Roman'", 'serif'],
      },
    },
  },
} satisfies Config
