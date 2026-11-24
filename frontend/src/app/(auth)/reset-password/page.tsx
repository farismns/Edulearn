"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import AuthPageShell, { FormNotice } from "@/features/auth/AuthPageShell";
import { getAuthErrorMessage, getQueryToken } from "@/features/auth/form-utils";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const [token] = useState(getQueryToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(token ? null : "This password reset link is missing its token.");
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!/^[a-f0-9]{64}$/.test(token)) return setError("This password reset link is invalid or has expired.");
    if (newPassword.length < 8) return setError("Password must contain at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      setSuccess(response.message || "Password reset successful. You can now sign in.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError, "Unable to reset your password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell title="Reset your password" description="Choose a new password for your EduLearn account.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <FormNotice>{error}</FormNotice> : null}
        {success ? <FormNotice tone="success">{success}</FormNotice> : null}
        <Input label="New password" type="password" autoComplete="new-password" required helperText="Use at least 8 characters." value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        <Button type="submit" className="w-full" disabled={isSubmitting || Boolean(success)}>
          {isSubmitting ? <Spinner size="sm" label="Resetting password..." className="mr-2" /> : null}
          {isSubmitting ? "Resetting password..." : "Reset password"}
        </Button>
        {success ? <Link href="/login" className="block text-center text-sm font-medium text-primary hover:text-primary-hover">Continue to sign in</Link> : null}
      </form>
    </AuthPageShell>
  );
}
