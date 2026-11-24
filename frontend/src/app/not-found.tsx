import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-secondary-text">The page you are looking for does not exist or has moved.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
