import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FormNotice({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg px-3 py-2.5 text-sm ${tone === "error" ? "bg-red-50 text-danger" : "bg-green-50 text-success"}`}
    >
      {children}
    </div>
  );
}

export default function AuthPageShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="w-full px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <Link href="/" className="mb-4 text-xl font-bold tracking-tight text-primary">
            EduLearn
          </Link>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          {footer ? <div className="mt-6 border-t border-border pt-5 text-center text-sm text-secondary-text">{footer}</div> : null}
        </CardContent>
      </Card>
    </main>
  );
}
