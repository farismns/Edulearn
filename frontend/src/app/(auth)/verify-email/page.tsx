"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import AuthPageShell, { FormNotice } from "@/features/auth/AuthPageShell";
import { getAuthErrorMessage, getQueryToken, isValidEmail } from "@/features/auth/form-utils";
import { apiFetch } from "@/lib/api";

export default function VerifyEmailPage() {
  const [token] = useState(getQueryToken);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">(token ? "loading" : "resend");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const processedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || processedToken.current === token) return;
    processedToken.current = token;

    void apiFetch<{ user: unknown }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((response) => {
        setMessage(response.message || "Email verified successfully. You can now sign in.");
        setStatus("success");
      })
      .catch((error) => {
        setMessage(getAuthErrorMessage(error, "This verification link is invalid or has expired."));
        setStatus("error");
      });
  }, [token]);

  async function resendVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!isValidEmail(email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(response.message || "If an account requires verification, a new email will be sent.");
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "Unable to resend the verification email."));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <main className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" label="Verifying your email..." /></main>;
  }

  if (status === "success") {
    return (
      <AuthPageShell title="Email verified" description="Your EduLearn account is ready.">
        <FormNotice tone="success">{message}</FormNotice>
        <Link href="/login" className="mt-5 block text-center text-sm font-medium text-primary hover:text-primary-hover">Continue to sign in</Link>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell title="Verify your email" description="Enter your account email to receive a new verification link.">
      {status === "error" && message ? <FormNotice>{message}</FormNotice> : null}
      {status === "error" ? <p className="mb-4 mt-3 text-sm text-secondary-text">You can request another link below.</p> : null}
      <form className="space-y-4" onSubmit={resendVerification} noValidate>
        {status === "resend" && message ? <FormNotice tone="success">{message}</FormNotice> : null}
        <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" label="Sending email..." className="mr-2" /> : null}
          {isSubmitting ? "Sending email..." : "Resend verification email"}
        </Button>
        <Link href="/login" className="block text-center text-sm text-secondary-text hover:text-foreground">Back to sign in</Link>
      </form>
    </AuthPageShell>
  );
}
