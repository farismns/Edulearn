import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RouteGuard } from "@/features/auth";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard mode="private">
      <AppLayout>{children}</AppLayout>
    </RouteGuard>
  );
}
