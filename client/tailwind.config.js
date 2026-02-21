/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream:   "#fdf6ed",
        parchment: "#f5ead8",
        peach:   "#e8a87c",
        rose:    "#e8909a",
        sage:    "#8fbfa8",
        sand:    "#c4a882",
        bark:    "#7c6a5e",
        muted:   "#9c8070",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        lora:   ["Lora", "serif"],
      },
    }
  },
  plugins: [],
}
