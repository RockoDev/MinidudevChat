/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    screens: {
      'xs': '448px',
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities, matchUtilities, theme }) => {
      addUtilities({
        '.scrollbar-w-thin': {
          'scrollbar-width': 'thin',
        },
      })
      matchUtilities(
        {
          scrollbar: value => ({
            scrollbarColor: `${value} transparent`,
          }),
        },
        {
          values: flattenColorPalette(theme('colors')),
          type: 'color',
        }
      )
    }),
  ],
}
