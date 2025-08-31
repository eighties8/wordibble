/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'flip-reveal': 'flip-reveal 0.8s ease-in-out forwards',
        'flip-reveal-slow': 'flip-reveal 1.2s ease-in-out forwards',
        'flip-reveal-gray': 'flip-reveal-gray 0.8s ease-in-out forwards',
        'flip-reveal-green': 'flip-reveal-green 0.8s ease-in-out forwards',
        'flip-reveal-amber': 'flip-reveal-amber 0.8s ease-in-out forwards',
      },
      keyframes: {
        'flip-reveal': {
          '0%': { 
            transform: 'rotateX(0deg)'
          },
          '50%': { 
            transform: 'rotateX(-90deg)'
          },
          '100%': { 
            transform: 'rotateX(0deg)'
          }
        },
        'flip-reveal-gray': {
          '0%': { 
            transform: 'rotateX(0deg)',
            backgroundColor: '#374151',
            color: '#9CA3AF'
          },
          '45%': { 
            transform: 'rotateX(-90deg)',
            backgroundColor: '#374151',
            color: '#9CA3AF'
          },
          '55%': { 
            transform: 'rotateX(-90deg)',
            backgroundColor: '#d1d5db',
            color: '#6b7280'
          },
          '100%': { 
            transform: 'rotateX(0deg)',
            backgroundColor: '#d1d5db',
            color: '#6b7280'
          }
        },
        'flip-reveal-green': {
          '0%': { 
            transform: 'rotateX(0deg)',
            backgroundColor: '#374151',
            color: '#9CA3AF'
          },
          '45%': { 
            transform: 'rotateX(-90deg)',
            backgroundColor: '#374151',
            color: '#9CA3AF'
          },
          '55%': { 
            transform: 'rotateX(-90deg)',
            backgroundColor: '#16a34a',
            color: '#ffffff'
          },
          '100%': { 
            transform: 'rotateX(0deg)',
            backgroundColor: '#16a34a',
            color: '#ffffff'
          }
        },
        'flip-reveal-amber': {
          '0%': { 
            transform: 'rotateX(0deg)',
            backgroundColor: '#374151',
            color: '#9CA3AF'
          },
          '45%': { 
            transform: 'rotateX(-90deg)',
            backgroundColor: '#374151',
            color: '#9CA3AF'
          },
          '55%': { 
            transform: 'rotateX(-90deg)',
            backgroundColor: '#f59e0b',
            color: '#ffffff'
          },
          '100%': { 
            transform: 'rotateX(0deg)',
            backgroundColor: '#f59e0b',
            color: '#ffffff'
          }
        }
      }
    },
  },
  plugins: [],
}
