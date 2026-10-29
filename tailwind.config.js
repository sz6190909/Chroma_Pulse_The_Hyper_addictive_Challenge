/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#090a0f',
          card: 'rgba(18, 22, 34, 0.85)',
          neonPink: '#ff2d75',
          neonCyan: '#00f0ff',
          neonGreen: '#00ff66',
          neonYellow: '#ffe600',
          neonPurple: '#b026ff',
        }
      },
      fontFamily: {
        game: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.6))' },
          '100%': { filter: 'drop-shadow(0 0 15px rgba(255, 45, 117, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
