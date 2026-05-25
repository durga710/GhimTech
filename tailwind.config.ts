import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // shadcn-style semantic tokens — driven by the CSS vars defined in
        // globals.css (:root). Stored as space-separated RGB channels so
        // Tailwind's <alpha-value> modifier (e.g. text-foreground/60) works.
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        // Carbon / matte black surfaces
        ink: {
          950: "#040508",
          900: "#07080c",
          850: "#0a0c12",
          800: "#0f1218",
          750: "#141821",
          700: "#1a1f2b",
          600: "#262c3a",
          500: "#3a4150",
        },
        // Electric blue — primary signal
        signal: {
          50: "#e6f4ff",
          100: "#bce0ff",
          200: "#7ec4ff",
          300: "#3aa4ff",
          400: "#0a87ff",
          500: "#006fe6",
          600: "#0058bf",
          700: "#004299",
          glow: "#3aa4ff",
        },
        // Emerald — healthcare / system-OK glow
        vital: {
          50: "#e6fff5",
          100: "#b3ffdf",
          200: "#66f5b8",
          300: "#1fe294",
          400: "#00c97a",
          500: "#00a665",
          600: "#008351",
          glow: "#1fe294",
        },
        // Tactical amber for warnings
        flare: {
          400: "#ffa726",
          500: "#fb8c00",
        },
        // Critical red
        critical: {
          400: "#ff5470",
          500: "#e63955",
        },
      },
      fontFamily: {
        // Editorial: Fraunces (display serif) + Hanken Grotesk (body) + IBM Plex Mono
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Tighter, more editorial scale
        "hero": ["clamp(3rem, 8vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em", fontWeight: "600" }],
        "display": ["clamp(2rem, 5vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "600" }],
        "title": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tactical: "0.18em",
      },
      boxShadow: {
        "glow-signal": "0 0 40px -10px rgba(58, 164, 255, 0.45), 0 0 90px -20px rgba(58, 164, 255, 0.25)",
        "glow-vital": "0 0 40px -10px rgba(31, 226, 148, 0.4), 0 0 90px -20px rgba(31, 226, 148, 0.2)",
        "carbon": "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px -20px rgba(0,0,0,0.6)",
        "panel": "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "carbon-grid":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "radial-signal":
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(58,164,255,0.18), transparent 70%)",
        "radial-vital":
          "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(31,226,148,0.12), transparent 70%)",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "grid-sm": "32px 32px",
        "grid-md": "64px 64px",
      },
      keyframes: {
        // Subtle pulse for live indicators
        pulse_signal: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(58,164,255,0.6)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 0 8px rgba(58,164,255,0)" },
        },
        pulse_vital: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(31,226,148,0.6)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 0 8px rgba(31,226,148,0)" },
        },
        // Scanning line across HUD elements
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "0.5" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        // Marquee for ticker
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Aurora background
        aurora: {
          "0%, 100%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "50%": { transform: "translate(2%, -2%) rotate(180deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-signal": "pulse_signal 2.4s ease-in-out infinite",
        "pulse-vital": "pulse_vital 2.4s ease-in-out infinite",
        scan: "scan 3s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        aurora: "aurora 18s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
