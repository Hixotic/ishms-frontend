/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Fonts ───────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["Cairo", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
        jakarta: ["'Plus Jakarta Sans'", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        inter:   ["Inter", "sans-serif"],
      },

      // ─── Colors ──────────────────────────────────────────────────────────
      colors: {
        // ── Your CSS-variable-driven tokens (doctor / reception / analysis) ──
        page:    "var(--bg-page)",
        panel:   "var(--bg-panel)",
        surface: "var(--bg-surface)",
        muted:   "var(--text-muted)",
        faint:   "var(--text-faint)",
        accent:  "var(--accent)",
        critical:"var(--critical)",
        stable:  "var(--stable)",
        ai:      "var(--ai)",

        // ── Nurse / shadcn CSS-variable tokens ───────────────────────────
        border:     "var(--border)",
        input:      "var(--input)",
        ring:       "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        status: {
          stable:      "var(--status-stable)",
          critical:    "var(--status-critical)",
          "needs-care":"var(--status-needs-care)",
        },
        news: {
          low:    "var(--news-low)",
          medium: "var(--news-medium)",
          high:   "var(--news-high)",
        },

        // ── Admin hardcoded tokens ────────────────────────────────────────
        bg:              "#F8FAFB",
        surf:            "#F2F4F5",
        "admin-accent":  "#2563EB",
        success:         "#22C55E",
        "admin-warning": "#F59E0B",
        danger:          "#EF4444",
        "txt-primary":   "#0F172A",
        "txt-secondary": "#64748B",
        "txt-muted":     "#94A3B8",
      },

      // ─── Border color shorthand ──────────────────────────────────────────
      borderColor: {
        DEFAULT: "var(--border)",
        light:   "var(--border-light)",
      },

      // ─── Background shorthand for status badges ──────────────────────────
      backgroundColor: {
        "critical-bg": "var(--critical-bg)",
        "warning-bg":  "var(--warning-bg)",
        "stable-bg":   "var(--stable-bg)",
        "accent-bg":   "var(--accent-bg)",
        "ai-bg":       "var(--ai-bg)",
      },

      // ─── Border radius ───────────────────────────────────────────────────
      borderRadius: {
        sm:    "calc(var(--radius) - 4px)",
        md:    "calc(var(--radius) - 2px)",
        lg:    "var(--radius)",
        xl:    "16px",
        "2xl": "20px",
      },

      // ─── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        card:        "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)",
        "card-hover":"0 4px 24px rgba(15,23,42,0.10)",
      },

      // ─── Animations ──────────────────────────────────────────────────────
      animation: {
        "critical-pulse": "criticalPulse 2.5s ease-in-out infinite",
        "slide-in":       "slideIn 0.2s ease-out",
        "fade-up":        "fadeUp 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};