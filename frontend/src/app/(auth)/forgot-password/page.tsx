"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import AuthPageShell, { FormNotice } from "@/features/auth/AuthPageShell";
import { getAuthErrorMessage, isValidEmail } from "@/features/auth/form-utils";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(response.message || "If an account exists, you will receive a reset link.");
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError, "Unable to request a password reset."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell title="Forgot password?" description="Enter your email and we will send reset instructions if an account exists.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <FormNotice>{error}</FormNotice> : null}
        {message ? <FormNotice tone="success">{message}</FormNotice> : null}
        <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" label="Sending reset link..." className="mr-2" /> : null}
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
        <Link href="/login" className="block text-center text-sm text-secondary-text hover:text-foreground">Back to sign in</Link>
      </form>
    </AuthPageShell>
  );
}
