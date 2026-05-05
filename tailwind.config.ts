import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Stager Depot brand
        olive: "#393D32",
        "olive-soft": "#4A4F42",
        "olive-line": "#2C302A",
        cream: "#F1E3C8",
        "cream-soft": "#F7EFDC",
        // Surfaces
        ink: "#1A1A17",
        body: "#FAFAF8",
        line: "#E7E3D8",
        muted: "#6B6B66",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
