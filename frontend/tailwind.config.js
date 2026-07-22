/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#7a8aba",
        "canvas-soft": "#9fbee7",
        periwinkle: "#8ba1d4",
        "chrome-indigo": "#3d4f97",
        "muted-indigo": "#60619c",
        carbon: "#21242e",
        signal: "#f68d1f",
        amber: "#ecab37",
        "nav-gold": "#e48600",
        primary: "#e60012",
        platinum: "#dedede",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        display: ['"Arial Black"', 'sans-serif'],
        pixel: ['"Press Start 2P"', '"VT323"', 'monospace']
      },
      boxShadow: {
        'bevel-btn': 'inset 1px 1px 0px rgba(255,255,255,0.7), inset -1px -1px 0px rgba(0,0,0,0.5)',
        'bevel-pressed': 'inset 2px 2px 2px rgba(0,0,0,0.6), inset -1px -1px 0px rgba(255,255,255,0.3)',
        'inset-panel': 'inset 2px 2px 4px rgba(0,0,0,0.4), inset -1px -1px 0px rgba(255,255,255,0.5)',
        'hard-drop': '3px 3px 0px #21242e',
      }
    },
  },
  plugins: [],
}
