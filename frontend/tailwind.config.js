/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dfe9ff",
          200: "#c5d6ff",
          300: "#a2bbff",
          400: "#7b96fc",
          500: "#5b70f6",
          600: "#4551ea",
          700: "#383fd0",
          800: "#3036a8",
          900: "#2d3485",
          950: "#1b1e4f",
        },
        // Asosiy rang - to'q ko'k-siyoh
        navy: {
          50: "#f4f6f9",
          100: "#e5e9f0",
          200: "#c7d0dd",
          300: "#9dadbf",
          400: "#6d83a0",
          500: "#4c6183",
          600: "#394b69",
          700: "#2e3d55",
          800: "#263247",
          900: "#20293a",
          950: "#1a2332", // asosiy navy
        },
        // Aksent rang - oltin/sariq
        gold: {
          50: "#fbf8eb",
          100: "#f6efcf",
          200: "#eedda2",
          300: "#e5c66b",
          400: "#ddb247",
          500: "#c9a227", // asosiy oltin
          600: "#ad851f",
          700: "#8a671c",
          800: "#73541e",
          900: "#63461f",
          950: "#39260f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgb(27 30 79 / 0.08)",
        card: "0 1px 2px rgb(27 30 79 / 0.05), 0 12px 32px -16px rgb(27 30 79 / 0.14)",
      },
    },
  },
  plugins: [],
};
