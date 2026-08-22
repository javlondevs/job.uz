/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
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
