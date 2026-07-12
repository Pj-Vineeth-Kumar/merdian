import type { Config } from "tailwindcss";

/**
 * Colors are wired to CSS custom properties defined in src/index.css so the same
 * utility (e.g. `bg-background`) resolves correctly in both light and dark themes.
 * Components MUST style through these semantic tokens, never raw palette classes.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Functional category hues (a map legend, not a second brand accent).
        // Kept muted so the single --primary accent stays dominant.
        cat: {
          food: "hsl(var(--cat-food))",
          sight: "hsl(var(--cat-sight))",
          outdoors: "hsl(var(--cat-outdoors))",
          culture: "hsl(var(--cat-culture))",
          nightlife: "hsl(var(--cat-nightlife))",
          shopping: "hsl(var(--cat-shopping))",
          transport: "hsl(var(--cat-transport))",
          stay: "hsl(var(--cat-stay))",
          other: "hsl(var(--cat-other))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "ui-sans-serif", "sans-serif"],
        sans: ['"Hanken Grotesk Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Shadows are tinted to the warm charcoal background, never pure black.
        card: "0 1px 0 0 hsl(var(--foreground) / 0.04), 0 14px 40px -22px hsl(20 40% 4% / 0.55)",
        lift: "0 2px 0 0 hsl(var(--foreground) / 0.05), 0 26px 60px -28px hsl(20 40% 4% / 0.7)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
