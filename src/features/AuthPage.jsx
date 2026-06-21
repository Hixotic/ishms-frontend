import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthProvider";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage({ defaultMode = "login" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(
    defaultMode === "register" ? "register" : "login",
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // FIXED: default role
  const [role, setRole] = useState("Receptionist");

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (location.pathname.toLowerCase().includes("register")) {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (auth.user) {
      navigate("/", { replace: true });
    }
  }, [auth.user, navigate]);

  const handleModeSwitch = () => {
    const nextMode = mode === "login" ? "register" : "login";

    setFormError("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    // reset role
    setRole("Receptionist");

    setMounted(false);

    setTimeout(() => {
      navigate(nextMode === "login" ? "/login" : "/register");
      requestAnimationFrame(() => setMounted(true));
    }, 150);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (mode === "register" && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      if (mode === "login") {
        await auth.login({
          email,
          password,
        });
      } else {
        await auth.register({
          fullName,
          email,
          password,
          role,
        });
      }

      navigate("/", { replace: true });
    } catch (error) {
      setFormError(error.message || "Please check your input and try again.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-6">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Soft neutral ambient layer */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />

        {/* Very subtle noise-like depth (optional soft light patch) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white opacity-40 blur-3xl dark:bg-slate-900 dark:opacity-30" />

        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white opacity-30 blur-3xl dark:bg-slate-900 dark:opacity-20" />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-xl shadow-black/10 border border-slate-100 overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.97)",
          transition:
            "opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400" />

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="mb-4"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.7)",
                transition:
                  "opacity 0.5s 0.1s ease, transform 0.5s 0.1s cubic-bezier(.175,.885,.32,1.275)",
              }}
            >
              <img
                src="/icons.png"
                alt="ISHMS Logo"
                className="w-16 h-16 object-contain"
              />
            </div>

            <div className="text-xs font-black tracking-widest text-blue-600 uppercase mb-1">
              ISHMS Portal
            </div>

            <h1 className="text-3xl font-black text-slate-900 text-center leading-tight">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>

            <p className="mt-2 text-sm text-slate-500 text-center leading-relaxed max-w-xs">
              {mode === "login"
                ? "Sign in to access dashboards, patient details, and analytics."
                : "Register with your hospital email to start using the ISHMS portal."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Doe"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Role */}
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputClass + " cursor-pointer"}
                  required
                >
                  <option value="Receptionist">Receptionist</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Email address
              </label>

              <input
                type="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                className={inputClass}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className={inputClass + " pr-12"}
                  required
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    className={inputClass + " pr-12"}
                    required
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Errors */}
            {(formError || auth.authError) && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-600">
                {formError || auth.authError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={auth.authLoading}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {auth.authLoading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Sign Up"}
            </button>

            {/* Switch : disabled until further notice 

            <p className="text-center text-sm text-slate-500 mt-1">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}

              <button
                type="button"
                onClick={handleModeSwitch}
                className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>*/}
          </form>
        </div>
      </div>
    </div>
  );
}
