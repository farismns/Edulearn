import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;
type CardSectionProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: CardSectionProps) {
  return (
    <div className={`flex flex-col gap-1.5 p-5 ${className}`} {...props} />
  );
}

export function CardTitle({ className = "", ...props }: CardSectionProps) {
  return (
    <h3
      className={`text-base font-semibold text-foreground ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: CardSectionProps) {
  return (
    <p className={`text-sm text-secondary-text ${className}`} {...props} />
  );
}

export function CardContent({ className = "", ...props }: CardSectionProps) {
  return <div className={`p-5 pt-0 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: CardSectionProps) {
  return (
    <div className={`flex items-center p-5 pt-0 ${className}`} {...props} />
  );
}
