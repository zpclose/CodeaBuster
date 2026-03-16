
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundImage: {
        'radial-spotlight': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 60%)',
        'radial-spotlight-sharp': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 40%)',
        'holographic-gradient': 'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.4) 45%, rgba(255, 255, 255, 0.4) 55%, transparent 80%)',
        'animated-border-gradient': 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))',
      },
      fontFamily: {
        body: ['Manrope', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        code: ['monospace'],
        serif: ['serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'ruby-red': '#9b111e',
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
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
      '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'neumorphic-light': '5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff',
        'neumorphic-light-inset': 'inset 5px 5px 10px #d0d0d0, inset -5px -5px 10px #ffffff',
        'gemstone': '0 0 5px #9b111e, 0 0 10px #9b111e, 0 0 15px #9b111e',
        'plasma-pulse': '0 0 8px #9b111e, 0 0 12px #ED1E28, 0 0 16px #9b111e',
        'ruby-red': '0 0 15px hsl(var(--primary) / 0.6), 0 0 5px hsl(var(--primary) / 0.8)',
      },
      textShadow: {
        'md': '0 2px 4px rgba(0,0,0,0.3)',
        'md-light': '0 1px 3px rgba(255,255,255,0.1)',
        'glow-primary': '0 0 8px hsl(var(--primary) / 0.5)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'pan': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pan-spotlight': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
          '50%': { transform: 'translate(50%, 50%) rotate(180deg) scale(1.2)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) scale(1)' },
        },
        'holographic-sheen': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'plasma-pulse': {
          '0%, 100%': { boxShadow: '0 0 6px #9b111e, 0 0 10px #ED1E28, 0 0 14px #9b111e' },
          '50%': { boxShadow: '0 0 10px #9b111e, 0 0 16px #ED1E28, 0 0 22px #9b111e' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pan': 'pan 60s linear infinite',
        'pan-spotlight': 'pan-spotlight 20s linear infinite',
        'holographic-sheen': 'holographic-sheen 2.5s linear infinite',
        'border-pan': 'border-pan 5s linear infinite',
        'plasma-pulse': 'plasma-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.text-shadow-md': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
         '.text-shadow-md-light': {
          textShadow: '0 1px 3px rgba(255, 255, 255, 0.1)',
        },
        '.filter-white': {
            filter: 'brightness(0) invert(1)',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
} satisfies Config;
