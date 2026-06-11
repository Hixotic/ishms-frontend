/**
 * AuthContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Real API response shape (login & register):
 * {
 *   isAuthenticated: true,
 *   message: "Account created Successfuly",
 *   token: "eyJ...",
 *   tokenExpiration: "2026-05-14T22:37:34Z",
 *   email: "rec@test.com",
 *   fullName: "Mariam mohammed",
 *   roles: ["receptionist"]
 * }
 *
 * Error shape (400):
 * {
 *   type: "https://...",
 *   title: "One or more validation errors occurred.",
 *   status: 400,
 *   errors: { Password: ["Password Must Have At least 6 digits"] }
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authLogin, authRegister, clearAuthToken } from '../api/apiHandler';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ishms-auth';

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── USER SHAPE NORMALIZER ────────────────────────────────────────────────────
// Turns the flat API response into a clean user object used throughout the app.

const normalizeUser = (payload) => {
  if (!payload) return null;
  return {
    email:           payload.email      ?? null,
    fullName:        payload.fullName   ?? null,
    roles:           payload.roles      ?? [],
    // Convenience: single role string e.g. "receptionist"
    role:            payload.roles?.[0] ?? null,
    tokenExpiration: payload.tokenExpiration ?? null,
  };
};

// ─── ERROR MESSAGE EXTRACTOR ──────────────────────────────────────────────────
// Handles both ASP.NET validation errors and simple message errors.

const extractErrorMessage = (error) => {
  const data = error?.data || error?.response?.data;

  // ASP.NET validation errors: { errors: { Password: ["msg"], Field: ["msg"] } }
  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) return messages.join(' ');
  }

  // Simple message
  return (
    data?.message ||
    data?.title   ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }) {
  // Rehydrate from localStorage on mount
  const stored      = loadStoredAuth();
  const storedUser  = normalizeUser(stored);
  const storedToken = stored?.token ?? null;

  const [user,        setUser]        = useState(storedUser);
  const [token,       setToken]       = useState(storedToken);
  const [authError,   setAuthError]   = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // ── Internal helpers ────────────────────────────────────────────────────────

  /** Apply successful auth response — update state + localStorage */
  const applyAuth = (apiResponse) => {
    // apiResponse is the raw data object from the API
    const normalizedUser = normalizeUser(apiResponse);
    const authToken      = apiResponse?.token ?? null;

    setUser(normalizedUser);
    setToken(authToken);
    // localStorage is already written by authLogin/authRegister in apiHandler
  };

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Login
   * @param {{ email: string, password: string }} credentials
   * @returns {{ user, token }}
   */
  const login = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      // authLogin saves to localStorage internally
      const { data } = await authLogin({ email, password });
      applyAuth(data);
      return { user: normalizeUser(data), token: data?.token };
    } catch (error) {
      const message = extractErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Register
   * @param {{ fullName: string, email: string, password: string, role: string }} details
   * role should be the full string: "doctor" | "nurse" | "receptionist" | "admin"
   * @returns {{ user, token }}
   */
  const register = async ({ fullName, email, password, role = 'doctor' }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      // authRegister saves to localStorage internally
      const { data } = await authRegister({ fullName, email, password, role });
      applyAuth(data);
      return { user: normalizeUser(data), token: data?.token };
    } catch (error) {
      const message = extractErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  /** Clear all auth state */
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    clearAuthToken(); // clears localStorage via apiHandler
  };

  // ── Context value ───────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      // State
      user,              // { email, fullName, role, roles, tokenExpiration }
      token,
      isAuthenticated: !!token,
      authError,
      authLoading,

      // Actions
      login,
      register,
      logout,
    }),
    [user, token, authError, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}