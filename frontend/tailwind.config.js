/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        primary: "#3b82f6",
        secondary: "#6366f1",

        bgMain: "#020617",
        bgCard: "#1e293b",
        borderColor: "#334155",

        textMain: "#e2e8f0",
        textMuted: "#94a3b8",
      },

      borderRadius: {
        xl2: "16px",
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.4)",
      },

      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },

    },
  },
  plugins: [],
};