"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "./auth-context";
import { getSafeInternalPath } from "./auth-rules.mjs";

type GuardMode = "private" | "auth";

function safeNextPath(value: string | null) {
  return getSafeInternalPath(value);
}

function loginDestination(pathname: string) {
  const search = typeof window === "undefined" ? "" : window.location.search;
  const destination = safeNextPath(`${pathname}${search}`);

  return destination && destination !== "/login"
    ? `/login?next=${encodeURIComponent(destination)}`
    : "/login";
}

function authPageDestination() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const next = new URLSearchParams(window.location.search).get("next");
  const destination = safeNextPath(next);

  return destination && !destination.startsWith("/login")
    ? destination
    : "/dashboard";
}

function GuardError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-foreground">
          We couldn&apos;t validate your session.
        </h1>
        <p className="mt-2 text-sm text-secondary-text">
          Check your connection and try again.
        </p>
        <Button className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </main>
  );
}

export default function RouteGuard({
  mode,
  children,
}: {
  mode: GuardMode;
  children: ReactNode;
}) {
  const { status, refreshSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const allowAuthenticatedTokenFlow =
    mode === "auth" &&
    (pathname === "/verify-email" || pathname === "/reset-password");

  useEffect(() => {
    if (mode === "private" && status === "unauthenticated") {
      router.replace(loginDestination(pathname));
    }

    if (mode === "auth" && status === "authenticated" && !allowAuthenticatedTokenFlow) {
      router.replace(authPageDestination());
    }
  }, [allowAuthenticatedTokenFlow, mode, pathname, router, status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Checking your session..." />
      </main>
    );
  }

  if (status === "error") {
    return <GuardError onRetry={() => void refreshSession()} />;
  }

  if (mode === "private" && status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Redirecting to login..." />
      </main>
    );
  }

  if (mode === "auth" && status === "authenticated" && !allowAuthenticatedTokenFlow) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Redirecting to your dashboard..." />
      </main>
    );
  }

  return children;
}
