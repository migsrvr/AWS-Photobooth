/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          base: '#1c3466',
          dark: '#003678',
          darker: '#182b58',
          ink: '#1E376C',
          deep: '#00075D',
          ultradeep: '#01164a',
        },
        orange: {
          cta: '#ff6f08',
          label: '#ff8400',
          warm: '#fbb515',
        },
        gold: {
          base: '#ffb700',
          warm: '#f2af00',
          bright: '#fafe00',
          light: '#ffc72c',
          pale: '#fffde8',
          soft: '#ffe38d',
          button: '#fff200',
        },
        blue: {
          meta: '#3868cc',
          aws: '#006AFF',
          deep: '#1500FF',
          light: '#2563eb',
          sky: '#60b8e4',
          midsky: '#6cabdd',
          softsky: '#b9d2df',
          pagebg: '#e0f1fd',
        },
        glass: {
          DEFAULT: 'rgba(237, 244, 255, 0.74)',
          soft: 'rgba(237, 244, 255, 0.38)',
          edge: 'rgba(255, 255, 255, 0.56)',
        },
        semantic: {
          error: '#f93c40',
          success: '#04990c',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        primary: ['Poppins', 'sans-serif'],
        headings: ['Montserrat', 'sans-serif'],
        body: ['Lexend', 'sans-serif'],
        forms: ['Inter', 'sans-serif'],
        display: ['Anton', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        glass: '20px',
      },
      boxShadow: {
        glass: '0 28px 90px rgba(0, 38, 87, 0.18)',
        glow: '0 0 40px rgba(251, 181, 21, 0.4)',
      },
      animation: {
        'float': 'float_up 4s ease-in-out infinite',
        'bob': 'gentle_bob 4s ease-in-out infinite',
        'pulse-dot': 'dot_pulse 1.5s ease-in-out infinite',
        'glow-border': 'border_glow 3s ease-in-out infinite',
        'fade-slide': 'fade_slide_in 0.5s ease-out',
        'bounce-in': 'bounce_in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        float_up: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        gentle_bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        dot_pulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        border_glow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(16, 185, 129, 0.7)' },
        },
        fade_slide_in: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounce_in: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
