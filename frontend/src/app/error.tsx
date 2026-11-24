"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-danger">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">We couldn&apos;t load this page.</h1>
        <p className="mt-3 text-sm text-secondary-text">Please try again. If the problem continues, return to the dashboard.</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
