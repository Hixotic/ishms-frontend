/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      // ─── Font ───────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Cairo", "sans-serif"],
      },

      // ─── Colors mapped to CSS variables ─────────────────────────────────
      // Usage: bg-page, text-primary, border-border, etc.
      colors: {
        page:    "var(--bg-page)",
        panel:   "var(--bg-panel)",
        surface: "var(--bg-surface)",

        primary: "var(--text-primary)",
        muted:   "var(--text-muted)",
        faint:   "var(--text-faint)",

        accent:  "var(--accent)",

        critical: "var(--critical)",
        warning:  "var(--warning)",
        stable:   "var(--stable)",
        ai:       "var(--ai)",
      },

      // ─── Border color shorthand ──────────────────────────────────────────
      borderColor: {
        DEFAULT: "var(--border)",
        light:   "var(--border-light)",
      },

      // ─── Background shorthand for status ────────────────────────────────
      backgroundColor: {
        "critical-bg": "var(--critical-bg)",
        "warning-bg":  "var(--warning-bg)",
        "stable-bg":   "var(--stable-bg)",
        "accent-bg":   "var(--accent-light)",
        "ai-bg":       "var(--ai-bg)",
      },

      // ─── Animations ──────────────────────────────────────────────────────
      animation: {
        "critical-pulse": "criticalPulse 2.5s ease-in-out infinite",
        "slide-in":       "slideIn 0.2s ease-out",
        "fade-up":        "fadeUp 0.3s ease-out",
      },
    },
  },

  plugins: [],
};