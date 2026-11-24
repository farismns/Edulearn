import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export default function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  const describedBy = error ? errorId : helperText ? descriptionId : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`
          h-10 w-full rounded-lg border bg-surface px-3
          text-sm text-foreground outline-none transition-colors
          placeholder:text-secondary-text
          focus-visible:border-primary focus-visible:ring-2
          focus-visible:ring-primary/20
          disabled:cursor-not-allowed disabled:bg-surface-secondary
          disabled:opacity-60
          ${error ? "border-danger focus-visible:border-danger focus-visible:ring-danger/20" : "border-border"}
          ${className}
        `}
        {...props}
      />

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-xs text-secondary-text">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
