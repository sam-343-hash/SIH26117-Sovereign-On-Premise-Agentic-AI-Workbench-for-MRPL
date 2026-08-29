import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // RefinaAI refinery palette
        abyss: "#05070a",        // near-black base, refinery-at-night
        slate: {
          950: "#0a0e14",
          900: "#0e131b",
          850: "#121824",
          800: "#161d2b",
          700: "#212a3d",
          600: "#37435c",
        },
        copper: {
          DEFAULT: "#e0883f",
          light: "#f4a860",
          dark: "#b8631f",
          glow: "#ff9d4d",
        },
        flux: {
          DEFAULT: "#3fd8c4", // teal "AI signal" accent
          light: "#7ef0e0",
          dark: "#1f9c8c",
        },
        alert: {
          amber: "#f5b942",
          red: "#e5484d",
          green: "#3fd88a",
        },
        border: "hsl(220 20% 22% / 0.6)",
        ring: "#3fd8c4",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 0%, rgba(63,216,196,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(224,136,63,0.08), transparent 40%)",
        "pipe-flow":
          "linear-gradient(90deg, transparent, rgba(224,136,63,0.6), transparent)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.45)",
        "glow-copper": "0 0 24px 0 rgba(224,136,63,0.35)",
        "glow-flux": "0 0 24px 0 rgba(63,216,196,0.35)",
      },
      keyframes: {
        flow: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flow: "flow 3s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        rise: "rise 0.4s ease-out both",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
