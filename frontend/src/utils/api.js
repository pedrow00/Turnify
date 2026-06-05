const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * fetch hacia el backend de Turnify.
 * Siempre manda cookies de sesión.
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  return response;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data;
}

export function apiGet(path) {
  return apiFetch(path).then(parseResponse);
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  }).then(parseResponse);
}

export function apiPut(path, body) {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  }).then(parseResponse);
}

export function apiDelete(path) {
  return apiFetch(path, { method: "DELETE" }).then(parseResponse);
}