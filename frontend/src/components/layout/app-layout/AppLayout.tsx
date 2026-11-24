"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Sidebar } from "../sidebar";
import { Navbar } from "../navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <Navbar onMenuOpen={() => setSidebarOpen(true)} />

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
