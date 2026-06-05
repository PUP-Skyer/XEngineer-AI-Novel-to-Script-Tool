/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a2e',
          elevated: '#222240',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#9898b0',
          muted: '#606078',
        },
        neon: {
          purple: '#a855f7',
          blue: '#6366f1',
          cyan: '#22d3ee',
          pink: '#ec4899',
          green: '#10b981',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans SC',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        'neon-purple': '0 0 10px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.15)',
        'neon-blue': '0 0 10px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.15)',
        'neon-cyan': '0 0 10px rgba(34, 211, 238, 0.3), 0 0 20px rgba(34, 211, 238, 0.15)',
        'neon-pink': '0 0 10px rgba(236, 72, 153, 0.3), 0 0 20px rgba(236, 72, 153, 0.15)',
        'neon-green': '0 0 10px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.15)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(168, 85, 247, 0.5)' },
          '50%': { borderColor: 'rgba(168, 85, 247, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
