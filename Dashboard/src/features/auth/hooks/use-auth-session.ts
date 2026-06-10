"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginWithPassword,
  registerWithPassword,
  type AuthCredentials,
  type AuthUser,
} from "../api/auth-api";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "../stores/auth-session-storage";

type AuthStatus = "authenticated" | "loading" | "unauthenticated";

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function useAuthSession() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const hydrationTimer = window.setTimeout(() => {
      const storedSession = readAuthSession();
      if (!storedSession) {
        setStatus("unauthenticated");
        return;
      }

      getCurrentUser(storedSession.token)
        .then((user) => {
          if (!active) return;

          const nextSession = {
            token: storedSession.token,
            user,
          };
          writeAuthSession(nextSession);
          setSession(nextSession);
          setStatus("authenticated");
          setError(null);
        })
        .catch((caught) => {
          if (!active) return;

          clearAuthSession();
          setSession(null);
          setStatus("unauthenticated");
          setError(
            caught instanceof Error ? caught.message : "Session expired.",
          );
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(hydrationTimer);
    };
  }, []);

  const authenticate = useCallback(
    async (
      mode: "login" | "register",
      credentials: AuthCredentials,
    ): Promise<AuthSession> => {
      setError(null);
      const response =
        mode === "login"
          ? await loginWithPassword(credentials)
          : await registerWithPassword(credentials);
      const nextSession = {
        token: response.access_token,
        user: response.user,
      };
      writeAuthSession(nextSession);
      setSession(nextSession);
      setStatus("authenticated");
      return nextSession;
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  return useMemo(
    () => ({
      authenticate,
      error,
      logout,
      session,
      status,
    }),
    [authenticate, error, logout, session, status],
  );
}
