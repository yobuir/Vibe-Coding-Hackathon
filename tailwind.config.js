/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Keep class-based dark mode but we'll prevent the 'dark' class
  theme: {
    extend: {
      colors: {
        background: '#ffffff', // Force light background
        foreground: '#171717', // Force dark text
      },
    },
  },
  plugins: [
    // Plugin to force light mode styles
    function({ addBase, addUtilities }) {
      addBase({
        ':root': {
          '--background': '#ffffff',
          '--foreground': '#171717',
        },
        'html, html.dark': {
          colorScheme: 'light !important',
          backgroundColor: '#ffffff !important',
          color: '#171717 !important',
        },
        'body': {
          backgroundColor: '#ffffff !important',
          color: '#171717 !important',
        }
      });
      
      // Override all dark mode utilities
      addUtilities({
        '.dark\\:bg-slate-900': { backgroundColor: '#ffffff !important' },
        '.dark\\:bg-slate-800': { backgroundColor: '#ffffff !important' },
        '.dark\\:bg-gray-900': { backgroundColor: '#ffffff !important' },
        '.dark\\:bg-gray-800': { backgroundColor: '#ffffff !important' },
        '.dark\\:text-white': { color: '#374151 !important' },
        '.dark\\:text-slate-300': { color: '#374151 !important' },
        '.dark\\:text-slate-400': { color: '#374151 !important' },
        '.dark\\:text-gray-300': { color: '#374151 !important' },
        '.dark\\:text-gray-400': { color: '#374151 !important' },
      });
    }
  ],
}
