import type { ReactNode } from "react";
import { RouteGuard } from "@/features/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard mode="auth">
      <div className="flex min-h-full flex-1 items-center justify-center">
        {children}
      </div>
    </RouteGuard>
  );
}
