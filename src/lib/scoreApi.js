import { getUserIdToken } from "./firebase";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");

async function request(path, options = {}) {
  const token = await getUserIdToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Unable to complete the score sync request.");
  }

  return response.json();
}

export async function syncUserSession() {
  const data = await request("/api/session", {
    method: "POST",
  });

  return data.user ?? null;
}
