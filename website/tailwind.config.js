/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.foreground'),
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              backgroundColor: `${theme('colors.muted.DEFAULT')} !important`,
              padding: '0.3rem 0.2rem',
              borderRadius: '0.25rem',
            },
            blockquote: {
              quotes: 'none',
              fontWeight: 'normal',
              fontStyle: 'normal',
              color: theme('colors.muted.foreground'),
            },
            pre: {
              color: theme('colors.foreground'),
              backgroundColor: theme('colors.muted.DEFAULT'),
            },
            'ul > li::marker': {
              color: theme('colors.foreground'),
            },
            'ol > li::marker': {
              color: theme('colors.foreground'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
