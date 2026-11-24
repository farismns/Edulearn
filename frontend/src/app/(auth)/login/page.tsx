"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import AuthPageShell, { FormNotice } from "@/features/auth/AuthPageShell";
import { getAuthErrorMessage, getSafeNextPath, isValidEmail } from "@/features/auth/form-utils";
import { useAuth } from "@/features/auth";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refreshSession();
      router.replace(getSafeNextPath());
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError, "Unable to sign in."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Welcome back"
      description="Sign in to manage your tutoring workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <FormNotice>{error}</FormNotice> : null}
        <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <div>
          <Input label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          <button type="button" className="mt-2 text-xs font-medium text-primary hover:text-primary-hover" onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" label="Signing in..." className="mr-2" /> : null}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <Link href="/" className="block text-center text-sm text-secondary-text hover:text-foreground">
          Back to website
        </Link>
      </form>
    </AuthPageShell>
  );
}
