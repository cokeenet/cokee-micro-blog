import { heroui } from '@heroui/theme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            borderRadius: {
                card: '0.75rem',
                panel: '1rem'
            },
            boxShadow: {
                'glow-soft': '0 10px 30px rgba(255, 127, 172, 0.2)',
                'glass-light': '0 18px 40px rgba(58, 71, 104, 0.16)',
                'glass-dark': '0 20px 52px rgba(2, 3, 8, 0.62)'
            },
            fontFamily: {
                headline: ['Quicksand', 'Nunito', 'Inter', 'sans-serif'],
                body: ['Quicksand', 'Nunito', 'Inter', 'sans-serif'],
                label: ['Quicksand', 'Nunito', 'Inter', 'sans-serif'],
                inter: ['Inter', 'sans-serif']
            }
        }
    },
    plugins: [heroui()]
};
