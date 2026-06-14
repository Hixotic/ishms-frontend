import API_BASE from "./config";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("ishms_token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  // Token expired → force logout
  if (res.status === 401) {
    localStorage.removeItem("ishms_user");
    localStorage.removeItem("ishms_token");
    window.location.href = "/";
    return;
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.title || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  get:    (url)       => request(url),
  post:   (url, body) => request(url, { method: "POST",   body: JSON.stringify(body) }),
  put:    (url, body) => request(url, { method: "PUT",    body: JSON.stringify(body) }),
  delete: (url)       => request(url, { method: "DELETE" }),
};
