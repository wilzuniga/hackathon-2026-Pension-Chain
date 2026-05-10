import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#131313',
        hazard: '#ffffff',
        jelly: '#3cffd0',
        ultraviolet: '#5200ff',
        slate: '#2d2d2d',
        imageframe: '#313131',
        deepblue: '#3860be',
        muted: '#e9e9e9',
        secondary: '#949494',
        consolemint: '#309875',
      },
      fontFamily: {
        manuka: ['var(--font-manuka)', 'Impact', 'Helvetica', 'sans-serif'],
        polysans: ['var(--font-polysans)', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'Courier New', 'Courier', 'monospace'],
      },
      letterSpacing: {
        'verge-tight': '-0.16px',
        'verge-normal': '0.32px',
        'verge-wide': '1.07px',
        'verge-mono-1': '1.1px',
        'verge-mono-15': '1.5px',
        'verge-mono-18': '1.8px',
        'verge-mono-19': '1.9px',
      },
    },
  },
  plugins: [],
};

export default config;
