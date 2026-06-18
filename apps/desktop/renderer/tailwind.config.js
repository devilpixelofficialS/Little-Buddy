/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../../src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0A0A0A",
          secondary: "#121212",
          tertiary: "#1A1A1A",
        },
        accent: {
          primary: "#3B82F6",
          secondary: "#60A5FA",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
        status: {
          listening: "#3B82F6",
          thinking: "#A855F7",
          executing: "#F59E0B",
          speaking: "#22C55E",
          error: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      maxWidth: {
        content: "1440px",
        sidebar: "320px",
        "agent-console": "400px",
        "floating-assistant": "480px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
