import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Locked by FRONTEND_BLUEPRINT.md §2 — do not invent alternates.
        bg: "#07090C",
        chrome: "#12161C",
        accent: "#00FF66",
        // Free axis: readable foreground + a quiet tone for "registry" stubs.
        foreground: "#E9EDEF",
        muted: "#5B6672",
        hairline: "#1D232B",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      transitionTimingFunction: {
        beat: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [typography],
};

export default config;
