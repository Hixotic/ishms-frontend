const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function roleFromAuthResponse(res) {
  const raw =
    res?.role ??
    (Array.isArray(res?.roles) ? res.roles[0] : null);
  return (raw || "").toLowerCase();
}

export function roleFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return "";
  const raw =
    payload[ROLE_CLAIM] ??
    payload.role ??
    (Array.isArray(payload.roles) ? payload.roles[0] : null);
  return (raw || "").toLowerCase();
}

export function buildUserFromAuthResponse(res, fallbackEmail) {
  const name = res.fullName || res.name || fallbackEmail;
  return {
    id: res.userId || res.id,
    name,
    email: res.email || fallbackEmail,
    role: roleFromAuthResponse(res),
    initials: name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export function loadStoredUser() {
  try {
    const saved = localStorage.getItem("ishms_user");
    if (!saved) return null;

    const user = JSON.parse(saved);
    if (user?.role) return user;

    const token = localStorage.getItem("ishms_token");
    const role = token ? roleFromToken(token) : "";
    if (role) return { ...user, role };

    return user;
  } catch {
    return null;
  }
}
