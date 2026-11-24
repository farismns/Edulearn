"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";

const navigationItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Schedules", href: "/schedules" },
  { label: "Students", href: "/students" },
  { label: "Learning Records", href: "/learning-records" },
  { label: "Settings", href: "/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function MenuIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function SidebarNavigation({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    onNavigate();
  }, [pathname, onNavigate]);

  return (
    <nav aria-label="Main navigation" className="flex-1">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-secondary-text">
        Menu
      </p>

      <div className="space-y-1">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center rounded-lg px-3 py-2.5
                text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-blue-50 text-primary"
                    : "text-secondary-text hover:bg-surface-secondary hover:text-foreground"
                }
              `}
              onClick={onNavigate}
            >
              <span aria-hidden="true" className={`mr-3 size-1.5 rounded-full ${isActive ? "bg-primary" : "bg-slate-300"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    if (isLoggingOut) return;

    setLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      onClose();
    } catch {
      setLogoutError("Logout could not be confirmed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        aria-label="Application sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[calc(100vw-2rem)] flex-col border-r border-border bg-surface px-5 py-6 shadow-xl transition-transform duration-200 ease-out lg:z-20 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-10 flex items-start justify-between px-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
          EduLearn
            </h1>
            <p className="mt-1 text-xs text-secondary-text">Tutoring Management</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-secondary-text transition-colors hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <SidebarNavigation onNavigate={onClose} />

        <div className="border-t border-border pt-4">
          {logoutError ? (
            <p role="alert" className="mb-3 px-2 text-xs text-danger">
              {logoutError}
            </p>
          ) : null}
          <button
            type="button"
            className="mb-4 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-secondary-text transition-colors hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
          <p className="px-2 text-xs text-secondary-text">EduLearn © 2026</p>
        </div>
      </aside>
    </>
  );
}

export { MenuIcon };
