/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary':              '#006a61',
        'on-primary':           '#ffffff',
        'primary-container':    '#9ef2e4',
        'on-primary-container': '#00201d',
        'surface':              '#f4fbf8',
        'surface-variant':      '#dae5e2',
        'surface-container':    '#eaf1ee',
        'on-surface':           '#161d1c',
        'on-surface-variant':   '#3f4948',
        'outline':              '#6f7977',
        'outline-variant':      '#bec9c6',
        'coral':                '#ae2f34',
        'mint':                 '#006c4f',
        'background':           '#f4fbf8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}