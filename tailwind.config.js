/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // ─── Fonts ───────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["Cairo", "sans-serif"],          // your default
        manrope: ["Manrope", "sans-serif"],        // his admin font
        jakarta: ["'Plus Jakarta Sans'", "sans-serif"], // his admin font
      },

      // ─── Colors ──────────────────────────────────────────────────────────
      colors: {
        // ── Your CSS-variable-driven tokens (doctor / reception / analysis) ──
        page:    "var(--bg-page)",
        panel:   "var(--bg-panel)",
        surface: "var(--bg-surface)",
        primary: "var(--text-primary)",
        muted:   "var(--text-muted)",
        faint:   "var(--text-faint)",
        accent:  "var(--accent)",
        critical:"var(--critical)",
        stable:  "var(--stable)",
        ai:      "var(--ai)",

        // ── His admin hardcoded tokens (kept as-is so his components don't break) ──
        bg:             "#F8FAFB",
        card:           "#FFFFFF",
        surf:           "#F2F4F5",
        "admin-accent": "#2563EB",   // renamed — avoids overwriting your --accent var
        success:        "#22C55E",
        "admin-warning":"#F59E0B",   // renamed — avoids overwriting your --warning var
        danger:         "#EF4444",
        "txt-primary":  "#0F172A",
        "txt-secondary":"#64748B",
        "txt-muted":    "#94A3B8",
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
        xl:  "16px",
        "2xl": "20px",
      },

      // ─── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        card:       "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)",
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
  plugins: [],
};