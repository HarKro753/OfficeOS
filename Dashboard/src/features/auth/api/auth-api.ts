export type AuthUser = {
  email: string;
  id: string;
  name: string | null;
  role: "customer" | "admin";
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;

  let message = `API request failed with ${response.status}`;
  try {
    const payload = (await response.json()) as { detail?: string };
    if (payload.detail) message = payload.detail;
  } catch {
    // Ignore non-JSON error bodies.
  }
  throw new Error(message);
}

export function registerWithPassword(credentials: AuthCredentials) {
  return fetch(`${apiBaseUrl}/auth/register`, {
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((response) => parseResponse<AuthResponse>(response));
}

export function loginWithPassword(credentials: AuthCredentials) {
  return fetch(`${apiBaseUrl}/auth/login`, {
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((response) => parseResponse<AuthResponse>(response));
}

export function bootstrapAdminWithPassword(
  credentials: AuthCredentials,
  bootstrapToken: string,
) {
  return fetch(`${apiBaseUrl}/auth/bootstrap-admin`, {
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
      "X-Bootstrap-Token": bootstrapToken,
    },
    method: "POST",
  }).then((response) => parseResponse<AuthResponse>(response));
}

export function getCurrentUser(token: string) {
  return fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => parseResponse<AuthUser>(response));
}
