import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#001F3F",
          light: "#0F325E",
          soft: "#29456D",
        },
        paper: "#FAFAF7",
        surface: "#FFFFFF",
        line: "#E4E0D6",
        slate: {
          DEFAULT: "#51607A",
          light: "#7C8AA3",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E0C465",
          dark: "#9C7E1C",
        },
        emerald: {
          DEFAULT: "#1C7C54",
          light: "#E4F3EC",
        },
        crimson: {
          DEFAULT: "#B3261E",
          light: "#FBEAE9",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 33, 61, 0.04), 0 8px 24px -8px rgba(20, 33, 61, 0.10)",
        panel: "0 12px 32px -12px rgba(20, 33, 61, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
