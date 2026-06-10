import type { AuthUser } from "../api/auth-api";

export type StoredAuthSession = {
  token: string;
  user: AuthUser;
};

const authSessionStorageKey = "officeos-auth-session-v1";

export function readAuthSession(): StoredAuthSession | null {
  try {
    const rawSession = window.localStorage.getItem(authSessionStorageKey);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as Partial<StoredAuthSession>;
    if (!session.token || !session.user?.email || !session.user.id) return null;

    return session as StoredAuthSession;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: StoredAuthSession) {
  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(authSessionStorageKey);
}
