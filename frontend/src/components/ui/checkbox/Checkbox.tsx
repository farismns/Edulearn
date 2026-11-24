import { useId, type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  helperText?: string;
  error?: string;
}

export default function Checkbox({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  const descriptionId = `${checkboxId}-description`;
  const errorId = `${checkboxId}-error`;

  const describedBy = error ? errorId : helperText ? descriptionId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <input
          {...props}
          id={checkboxId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`
            mt-0.5 size-4 shrink-0 cursor-pointer
            rounded border-border accent-primary
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-primary
            focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
        />

        <label
          htmlFor={checkboxId}
          className="cursor-pointer text-sm font-medium text-foreground"
        >
          {label}
        </label>
      </div>

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
