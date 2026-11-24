"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import AuthPageShell, { FormNotice } from "@/features/auth/AuthPageShell";
import { getAuthErrorMessage, isValidEmail } from "@/features/auth/form-utils";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim()) return setError("Enter your full name.");
    if (!isValidEmail(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must contain at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiFetch<{ email: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          ...(setupSecret ? { setupSecret } : {}),
        }),
      });
      setSuccess(response.message || "Registration successful. Check your email to verify your account.");
      setPassword("");
      setConfirmPassword("");
      setSetupSecret("");
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Create your account"
      description="Set up the EduLearn workspace for your tutoring practice."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover">Sign in</Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <FormNotice>{error}</FormNotice> : null}
        {success ? <FormNotice tone="success">{success} <Link href="/verify-email" className="mt-2 block font-medium underline">Go to email verification</Link></FormNotice> : null}
        <Input label="Full name" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input label="Password" type="password" autoComplete="new-password" required helperText="Use at least 8 characters." value={password} onChange={(event) => setPassword(event.target.value)} />
        <Input label="Confirm password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        <Input label="Setup secret" type="password" autoComplete="off" helperText="Required only for production owner setup. It is never stored in the browser." value={setupSecret} onChange={(event) => setSetupSecret(event.target.value)} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" label="Creating account..." className="mr-2" /> : null}
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
