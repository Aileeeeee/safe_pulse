import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SAFEPULSE design tokens
        sidebar: {
          DEFAULT: "#1c3a2e",
          hover: "#2a4f3e",
          active: "#3a6b52",
        },
        emerald: {
          sp: "#1c6e4e",
          mid: "#2d8a62",
          light: "#e8f2ec",
          pale: "#f0f7f3",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8f6f2",
        },
        bg: {
          DEFAULT: "#f0ede8",
        },
        danger: {
          DEFAULT: "#d63b3b",
          light: "#fdf0f0",
        },
        warning: {
          DEFAULT: "#e07c2a",
          light: "#fdf3ea",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        sp: "12px",
        "sp-lg": "16px",
        "sp-xl": "20px",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)",
        modal: "0 4px 40px rgba(0,0,0,0.12)",
      },
      animation: {
        "pulse-live": "pulse-live 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-in": "slideIn 0.3s ease",
        "fade-up": "fadeUp 0.22s ease",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" },
          "50%": { boxShadow: "0 0 0 6px rgba(34,197,94,0.08)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
