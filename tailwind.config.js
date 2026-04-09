/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#eefbf0",
          100: "#d5f3da",
          200: "#b0e7bc",
          300: "#7dd194",
          400: "#48b06b",
          500: "#2c9152",
          600: "#1f7340",
          700: "#195b34",
          800: "#16482b",
          900: "#143c25"
        },
        bark: {
          50: "#fff9f1",
          100: "#ffedd6",
          200: "#ffd7ae",
          300: "#ffbb78",
          400: "#fd9540",
          500: "#f47618",
          600: "#e35d0d",
          700: "#bc450d",
          800: "#963814",
          900: "#792f14"
        }
      },
      boxShadow: {
        ambient: "0 24px 80px rgba(8, 20, 15, 0.35)"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "\"Times New Roman\"", "serif"],
        body: ["\"Trebuchet MS\"", "\"Segoe UI\"", "sans-serif"]
      }
    }
  },
  plugins: []
};
