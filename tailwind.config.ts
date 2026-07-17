import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {
      colors: {
        paper: "#F5F6F1",
        ink: "#12201C",
        harbor: {
          DEFAULT: "#0B4C5F",
          dark: "#083845"
        },
        spruce: {
          DEFAULT: "#1F6B4F",
          light: "#E7F0EA"
        },
        route: {
          DEFAULT: "#C1502B",
          dark: "#9C3F21"
        },
        line: "#DBE0D6",
        muted: "#5B665F"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      letterSpacing: {
        stencil: "0.01em"
      },
      maxWidth: {
        content: "1180px"
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(11, 76, 95, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
