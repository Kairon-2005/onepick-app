/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cosmic Dream Theme
        'cosmic-dark': '#0a0a1f',
        'cosmic-purple': '#1a1a3e',
        'cosmic-blue': '#1e2642',
        'glow-pink': '#FF6B9D',
        'glow-blue': '#4ECDC4',
        'glow-purple': '#A259FF',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 50%, #1e2642 100%)',
        'glow-gradient': 'linear-gradient(135deg, #FF6B9D 0%, #A259FF 50%, #4ECDC4 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(30px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
