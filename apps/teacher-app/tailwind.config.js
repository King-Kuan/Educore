/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e6f0e8",
          100: "#c0d8c6",
          600: "#1a3a2a",
          700: "#162f22",
        },
        rw: { green: "#20603D", yellow: "#FAD201", blue: "#00A1DE" },
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
