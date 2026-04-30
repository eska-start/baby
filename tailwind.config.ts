import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        bg: "#F7F4EE",
        card: "#FFFFFF",
        ink: "#1F1A14",
        "ink-soft": "#4A4239",
        "ink-mute": "#8B8377",
        accent: "#D77B50",
        "accent-soft": "#FCE5D2",
        good: "#5C7A5C",
        "good-soft": "#E5EFE3",
        warn: "#C49B3A",
        "warn-soft": "#F5EAC4",
        line: "rgba(31, 26, 20, 0.08)",
        "line-strong": "rgba(31, 26, 20, 0.18)",
      },
      boxShadow: {
        soft: "0 1px 4px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
