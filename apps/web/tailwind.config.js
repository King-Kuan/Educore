/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 600: "#1a3a2a", 700: "#163224" },
        rw:    { green: "#20603D", yellow: "#FAD201", blue: "#00A1DE" },
      },
    },
  },
  plugins: [],
};
