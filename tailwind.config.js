/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tosca: {
          50: '#e8f5f0',
          100: '#c5e6d6',
          200: '#9ed4b8',
          300: '#6dbd97',
          400: '#3da677',
          500: '#1a8a5f',
          600: '#006a4e',
          700: '#00553e',
          800: '#004131',
          900: '#002d22',
        },
        surface: {
          50: '#f8fafb',
          100: '#f1f4f6',
          200: '#e2e8ea',
          300: '#cbd3d7',
          400: '#94a2ab',
          500: '#64727e',
          600: '#4f5a65',
          700: '#3d464f',
          800: '#2d343b',
          900: '#1a2025',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
