/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#60a5fa',
              },
            },
            strong: {
              color: '#fff',
            },
            code: {
              color: '#fff',
              backgroundColor: '#1f2937',
              padding: '0.25rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#fff',
            },
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fff',
            },
            h3: {
              color: '#fff',
            },
            h4: {
              color: '#fff',
            },
            p: {
              color: '#fff',
            },
            li: {
              color: '#fff',
            },
            blockquote: {
              color: '#d1d5db',
              borderLeftColor: '#374151',
            },
          },
        },
      },
    },
  },
  plugins: [
    // @ts-ignore
    require('@tailwindcss/typography'),
  ],
};