/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#05070b",
        foreground: "#f8f8f8",
        card: "#0f1216",
        "card-foreground": "#f8f8f8",
        popover: "#0f1216",
        "popover-foreground": "#f8f8f8",
        primary: "#26cb96",
        "primary-foreground": "#05070b",
        secondary: "#1f2227",
        "secondary-foreground": "#f8f8f8",
        muted: "#181b1f",
        "muted-foreground": "#8f8f8f",
        accent: "#26cb96",
        "accent-foreground": "#fefeff",
        destructive: "#de3b3d",
        "destructive-foreground": "#f8f8f8",
        border: "#26292e",
        input: "#181b1f",
        ring: "#26cb96",
      },
      borderRadius: {
        lg: 12,
        md: 10,
        sm: 8,
      },
    },
  },
  plugins: [],
};

