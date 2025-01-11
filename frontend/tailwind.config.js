/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        table: {
                            width: '100%',
                        },
                        'thead th': {
                            backgroundColor: '#f9fafb',
                            fontWeight: '600',
                            borderBottom: '1px solid #e5e7eb',
                        },
                        'tbody tr': {
                            borderBottom: '1px solid #e5e7eb',
                        },
                        'tbody td': {
                            padding: '1rem',
                        },
                        'tr:nth-child(even)': {
                            backgroundColor: '#f9fafb',
                        },
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
