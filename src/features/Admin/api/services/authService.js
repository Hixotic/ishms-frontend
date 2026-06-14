import { api } from "../client";

export const authService = {
  /**
   * POST /api/Auth/login
   * Body: { email, password }
   * Returns: { id, token, fullName, email, roles: ["Admin"] }
   */
  login: (email, password) =>
    api.post("/Auth/login", { email, password }),

  /**
   * POST /api/Auth/register
   * Body: { fullName, email, password, role }
   */
  register: (data) =>
    api.post("/Auth/register", data),
};
