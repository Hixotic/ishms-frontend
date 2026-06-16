import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { authService } from "../api/services/authService";
import { buildUserFromAuthResponse } from "../api/authUtils";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // ── Real API: POST /api/Auth/login ─────────────────────────────────
      const res = await authService.login(email, password);

      /*
       * API response shape:
       * { id, token, fullName, email, roles: ["Admin"] }
       */
      localStorage.setItem("ishms_token", res.token);

      const user = buildUserFromAuthResponse(res, email);

      setFadeIn(true);
      setTimeout(() => {
        onLogin(user);
        navigate("/");
      }, 300);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div
      className={`min-h-screen bg-bg flex transition-opacity duration-300 ${fadeIn ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* ── Left blue panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-accent flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-20 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img
            src="/src/iconflat_v2-removebg-preview.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="font-manrope font-extrabold text-white text-xl tracking-tight">
            iSHMS
          </span>
        </div>

        {/* Headline */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-[12px] font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            Hospital Management System
          </div>
          <h2 className="font-manrope font-extrabold text-white text-[34px] leading-tight mb-4">
            Smart care,
            <br />
            smarter management.
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed">
            Real-time ward oversight, clinical alerts, staff coordination — all
            in one unified dashboard designed for modern hospital workflows.
          </p>
        </div>

        <p className="relative text-white/40 text-[12px]">
          © 2025 iSHMS · Secure medical platform
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <img
              src="/src/iconflat_v2-removebg-preview.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="font-manrope font-extrabold text-accent text-xl">
              iSHMS
            </span>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-manrope font-extrabold text-txt-primary text-[28px] leading-tight">
              Welcome back
            </h1>
            <p className="text-txt-secondary text-[14px] mt-1.5">
              Sign in to your hospital dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Email */}
            <div>
              <label className="block text-[12px] font-bold text-txt-secondary mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@hospital.com"
                autoComplete="email"
                className={`w-full h-11 px-4 rounded-xl border bg-white text-[14px] text-txt-primary outline-none transition-all duration-150
                  ${
                    error
                      ? "border-danger focus:border-danger"
                      : "border-slate-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)]"
                  }`}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-bold text-txt-secondary uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[12px] text-accent font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full h-11 pl-4 pr-11 rounded-xl border bg-white text-[14px] text-txt-primary outline-none transition-all duration-150
                    ${
                      error
                        ? "border-danger focus:border-danger"
                        : "border-slate-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)]"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary transition-colors"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-danger text-[13px] font-medium px-4 py-3 rounded-xl">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit button with spinner */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-accent text-white font-bold text-[14px] flex items-center justify-center gap-2.5
                hover:bg-blue-700 active:scale-[0.98] transition-all duration-150
                shadow-[0_2px_12px_rgba(37,99,235,0.30)]
                disabled:opacity-80 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white/80"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
