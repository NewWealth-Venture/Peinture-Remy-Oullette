import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: "#F58220",
          blue: "#1E3A8A",
        },
        neutral: {
          white: "#FFFFFF",
          text: "#111111",
          "text-secondary": "#6B7280",
          border: "#E5E7EB",
          "bg-subtle": "#F9FAFB",
          "bg-active": "#F3F4F6",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        h1: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        "section-title": ["14px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        "caption-xs": ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        "sidebar-rail": "64px",
        "sidebar-panel": "240px",
        topbar: "56px",
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
