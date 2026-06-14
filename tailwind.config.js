/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#2f3137",
        cream: "#fff8ed",
        coral: "#ff8f70",
        blush: "#ffd9df",
        lavender: "#d9d3ff",
        skysoft: "#bfe9ff",
      },
      boxShadow: {
        glow: "0 20px 70px rgba(255, 143, 112, 0.18)",
      },
    },
  },
  plugins: [],
};
