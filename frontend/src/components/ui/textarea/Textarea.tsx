import { useId, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export default function Textarea({
  label,
  helperText,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  const descriptionId = `${textareaId}-description`;
  const errorId = `${textareaId}-error`;

  const describedBy = error ? errorId : helperText ? descriptionId : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
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

      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`
          w-full resize-y rounded-lg border bg-surface
          px-3 py-2.5 text-sm text-foreground
          outline-none transition-colors
          placeholder:text-secondary-text
          focus-visible:border-primary
          focus-visible:ring-2 focus-visible:ring-primary/20
          disabled:cursor-not-allowed
          disabled:bg-surface-secondary
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
