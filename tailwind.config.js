/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0c0e12',
          surface: '#141820',
          panel: '#1b202c',
          border: '#2a3244',
          accent: '#00f0ff',
          neonAmber: '#ffaa00',
          neonGreen: '#00ff88',
          neonRose: '#ff3366',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
