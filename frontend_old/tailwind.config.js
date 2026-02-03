/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                heading: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: {
                    light: '#a78bfa',
                    DEFAULT: '#7c3aed',
                    dark: '#5b21b6',
                },
                secondary: {
                    light: '#22d3ee',
                    DEFAULT: '#0891b2',
                    dark: '#155e75',
                },
                accent: '#f472b6',
                // Reference specific colors
                lavender: '#F0E6F7',
                cyan: {
                    400: '#22d3ee',
                    500: '#06b6d4',
                }
            },
            animation: {
                'blob': 'blob 10s infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
                    '66%': { transform: 'translate(-30px, 30px) scale(0.95)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-30px)' },
                }
            }
        },
    },
    plugins: [],
}
