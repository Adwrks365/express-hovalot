import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /** Express Hovalot production palette (Elementor post-2701.css) */
        brand: {
          50: "#f4faf4",
          100: "#e3f3e3",
          200: "#c5e6c5",
          300: "#8fd08f",
          400: "#46CF46",
          500: "#39A739",
          600: "#2d8a2d",
          700: "#13330E",
          800: "#003405",
          900: "#1B2C1D",
          950: "#0a1f0a",
        },
        accent: {
          DEFAULT: "#CFBD1A",
          300: "#FFF063",
          400: "#E5D53E",
          500: "#CFBD1A",
          dark: "#a89815",
        },
        coral: {
          DEFAULT: "#FE8066",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#F8F8F8",
          dark: "#13330E",
        },
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        wide: "90rem",
        standard: "77.5rem",
        content: "62.5rem",
        prose: "51rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 52 5 / 0.06), 0 1px 2px -1px rgb(0 52 5 / 0.06)",
        soft: "0 4px 16px -4px rgb(0 52 5 / 0.1)",
        elevated: "0 12px 32px -8px rgb(0 52 5 / 0.12)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to left, rgba(0,45,18,0.82) 0%, rgba(0,45,18,0.55) 38%, rgba(0,45,18,0.22) 62%, rgba(0,45,18,0.08) 100%)",
        "trust-gradient":
          "linear-gradient(to left, rgba(0,52,5,0.78) 0%, rgba(0,52,5,0.42) 36%, rgba(0,52,5,0.08) 58%, transparent 72%)",
        "header-gradient": "linear-gradient(180deg, #13330E 0%, #003405 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
