"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiFetch,
  ApiError,
  setApiEventHandlers,
} from "@/lib/api";
import { getLogoutClientState, getSessionStatusFromHttp } from "./auth-rules.mjs";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  emailVerifiedAt?: string | null;
}

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  rateLimitMessage: string | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  serverLogoutConfirmed: boolean | null;
  clearRateLimitMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [serverLogoutConfirmed, setServerLogoutConfirmed] = useState<boolean | null>(null);

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    setServerLogoutConfirmed(null);
  }, []);

  const handleRateLimited = useCallback((apiError: ApiError) => {
    setRateLimitMessage(apiError.message);
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await apiFetch<{ user: AuthUser }>("/api/auth/me", {
        suppressAuthEvents: true,
        requiresSession: true,
      });

      if (!response.data?.user) {
        throw new Error("The session response did not include a user.");
      }

      setUser(response.data.user);
      setStatus("authenticated");
      setServerLogoutConfirmed(null);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        setUser(null);
        setStatus(getSessionStatusFromHttp(caughtError.status) as AuthStatus);
        setServerLogoutConfirmed(null);
        return;
      }

      setUser(null);
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to validate the current session.",
      );
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);

    try {
      await apiFetch("/api/auth/logout");
      const logoutState = getLogoutClientState(true);
      setUser(null);
      setStatus(logoutState.status as AuthStatus);
      setServerLogoutConfirmed(logoutState.serverRevocationConfirmed);
    } catch (caughtError) {
      const logoutState = getLogoutClientState(false);
      setUser(null);
      setStatus(logoutState.status as AuthStatus);
      setServerLogoutConfirmed(logoutState.serverRevocationConfirmed);
      setError("Logout could not be confirmed. Your session may still be active.");
      throw caughtError;
    }
  }, []);

  useEffect(() => {
    setApiEventHandlers({
      onUnauthorized: handleUnauthorized,
      onRateLimited: handleRateLimited,
    });

    return () => setApiEventHandlers({});
  }, [handleRateLimited, handleUnauthorized]);

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(bootstrapTimer);
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      error,
      rateLimitMessage,
      serverLogoutConfirmed,
      refreshSession,
      logout,
      clearRateLimitMessage: () => setRateLimitMessage(null),
    }),
    [error, logout, rateLimitMessage, refreshSession, serverLogoutConfirmed, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
