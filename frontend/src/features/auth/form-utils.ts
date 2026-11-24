import { ApiError } from "@/lib/api";
import { getSafeInternalPath } from "./auth-rules.mjs";

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error instanceof Error ? error.message : fallback;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getSafeNextPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const next = new URLSearchParams(window.location.search).get("next");

  return next && getSafeInternalPath(next) && !next.startsWith("/login")
    ? next
    : "/dashboard";
}

export function getQueryToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("token") || "";
}
