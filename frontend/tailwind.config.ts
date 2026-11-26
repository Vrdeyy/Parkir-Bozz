import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parkir: {
          dark: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          accent: "#2563eb",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
      boxShadow: {
        "tactile-sm": "0 2px 0 0 rgba(0, 0, 0, 0.25)",
        tactile: "0 4px 0 0 rgba(0, 0, 0, 0.25)",
        "tactile-lg": "0 6px 0 0 rgba(0, 0, 0, 0.35)",
        "tactile-blue": "0 4px 0 0 #1d4ed8",
        "tactile-emerald": "0 4px 0 0 #047857",
        "tactile-amber": "0 4px 0 0 #b45309",
        "tactile-rose": "0 4px 0 0 #be123c",
        "tactile-slate": "0 4px 0 0 #334155",
        "tactile-zinc": "0 4px 0 0 #27272a",
      },
    },
  },
  plugins: [],
};
export default config;
