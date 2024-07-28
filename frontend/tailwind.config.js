/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    screens: {
      'xs': '448px',
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [],
}
