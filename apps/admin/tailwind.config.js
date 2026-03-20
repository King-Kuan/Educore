/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e6f0e8",
          100: "#c0d8c6",
          200: "#96bea1",
          300: "#6ba47c",
          400: "#4d9160",
          500: "#2d7d46",
          600: "#1a3a2a",   // primary dark green
          700: "#163224",
          800: "#11291d",
          900: "#0b1f15",
        },
        rw: {
          green:  "#20603D",
          yellow: "#FAD201",
          blue:   "#00A1DE",
        },
      },
      fontFamily: {
        sans:  ["var(--font-barlow)", "system-ui", "sans-serif"],
        serif: ["var(--font-crimson)", "Georgia", "serif"],
        mono:  ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};
