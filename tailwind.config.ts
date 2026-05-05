import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        paper: "#f8f5f0",
        accent: "#8a5a2b",
        line: "#e7e1d6",
        muted: "#78716c",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["'Cormorant Garamond'", "'Iowan Old Style'", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
