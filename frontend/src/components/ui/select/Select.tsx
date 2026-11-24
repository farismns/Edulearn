import { useId, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export default function Select({
  label,
  options,
  placeholder = "Select an option",
  helperText,
  error,
  id,
  className = "",
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const descriptionId = `${selectId}-description`;
  const errorId = `${selectId}-error`;

  const describedBy = error ? errorId : helperText ? descriptionId : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
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

      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`
          h-10 w-full rounded-lg border bg-surface
          px-3 text-sm text-foreground outline-none
          transition-colors
          focus-visible:border-primary
          focus-visible:ring-2 focus-visible:ring-primary/20
          disabled:cursor-not-allowed
          disabled:bg-surface-secondary
          disabled:opacity-60
          ${error ? "border-danger focus-visible:border-danger focus-visible:ring-danger/20" : "border-border"}
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

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
