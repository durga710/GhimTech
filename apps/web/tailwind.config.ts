import type { Config } from "tailwindcss";

/**
 * GhimTech Tax design tokens.
 * Brand: deep navy from the GT monogram with an azure accent.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FC",
          100: "#D8E5F7",
          200: "#AFC9EE",
          300: "#7FA8E2",
          400: "#4F83D3",
          500: "#2E6BD6", // azure accent from the logo
          600: "#2456AE",
          700: "#1B3F80",
          800: "#16325F", // primary navy from the logo
          900: "#0F2547",
          950: "#0A1930",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgb(15 37 71 / 0.06), 0 8px 24px -12px rgb(15 37 71 / 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
