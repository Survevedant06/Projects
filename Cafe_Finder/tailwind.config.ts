import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nomad: {
          // Deep Marine Navy
          navy: {
            950: '#090D16',
            900: '#0F172A',
            850: '#151F34',
            800: '#1E293B',
            700: '#334155',
            600: '#475569',
          },
          // Warm Sand / Dune Canvas
          sand: {
            50: '#FAF8F5',
            100: '#F8F5F0',
            200: '#F1ECE4',
            300: '#E8E2D8',
            400: '#D9D0C3',
            500: '#C4B8A5',
          },
          // Capri / Coastal Teal
          teal: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            400: '#38BDF8',
            500: '#0EA5E9',
            600: '#0284C7',
            700: '#0369A1',
          },
          // Burnt Sienna
          sienna: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
          },
          // Subtle Sandstone Borders
          border: {
            light: '#E2DCD5',
            DEFAULT: '#D3CBC1',
            dark: '#243247',
          },
          muted: {
            light: '#78716C',
            dark: '#94A3B8',
          },
        },
      },
      boxShadow: {
        'dune': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'dune-lg': '0 10px 30px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'teal-glow': '0 0 20px rgba(14, 165, 233, 0.35)',
        'sienna-glow': '0 0 20px rgba(234, 88, 12, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
