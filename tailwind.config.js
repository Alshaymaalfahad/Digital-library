/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "rawaa" = the warm, consumer-facing identity (parents/children).
        // Close to the original Naseej red already, refined to match the
        // maroon/burgundy + night-purple palette from the reference art.
        rawaa: {
          red: "#1EA7DD",
          redDark: "#147EA8",
          redTint: "#E3F4FB",
          purple: "#147EA8",
          navy: "#1E2A5E",
          teal: "#0E8A96",
          green: "#67B93E",
          gold: "#C9A24B",
          gray: "#E8E8E7",
          grayDark: "#6B6664",
          ink: "#241715",
          cream: "#FBF7F3",
        },
        // "medad" = MEDAD's official B2B brand system — used ONLY in the
        // admin dashboard, per the MEDAD Design System doc (Brand/500 etc).
        medad: {
          25: "#F2F5FA",
          50: "#E9EFF8",
          100: "#D0DCEF",
          200: "#B4C8E6",
          300: "#93B1DD",
          400: "#6898D4",
          500: "#0079CA",
          600: "#006FB8",
          700: "#0063A5",
          800: "#005690",
          900: "#004675",
          950: "#003052",
          gray50: "#FAFAFA",
          gray100: "#F5F5F5",
          gray200: "#E9EAEB",
          gray300: "#D6D8DC",
          gray500: "#717680",
          gray700: "#414651",
          gray900: "#181D27",
        },
      },
      fontFamily: {
        arabic: ["Thmanyah Sans", "sans-serif"],
        display: ["Thmanyah Serif Display", "serif"],
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(36,23,21,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
