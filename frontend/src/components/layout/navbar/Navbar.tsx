"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { MenuIcon } from "../sidebar/Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schedules": "Schedules",
  "/students": "Students",
  "/learning-records": "Learning Records",
  "/settings": "Settings",
};

function NavbarContent() {
  const pathname = usePathname();

  const pageTitle =
    pageTitles[pathname] ??
    (pathname.startsWith("/students/")
      ? "Student Details"
      : pathname.startsWith("/schedules/")
        ? "Schedule Details"
        : "EduLearn");

  return (
    <>
      <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        <Avatar name="Tutor" size="sm" />

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground">Tutor</p>
          <p className="text-xs text-secondary-text">Administrator</p>
        </div>
      </div>
    </>
  );
}

export default function Navbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="flex h-16 min-w-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Open navigation menu"
        className="mr-3 rounded-lg p-2 text-secondary-text transition-colors hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        onClick={onMenuOpen}
      >
        <MenuIcon />
      </button>
      <Suspense
        fallback={
          <h1 className="text-lg font-semibold text-foreground">EduLearn</h1>
        }
      >
        <NavbarContent />
      </Suspense>
    </header>
  );
}
