interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-[3px]",
  lg: "size-8 border-4",
};

export default function Spinner({
  size = "md",
  className = "",
  label = "Loading...",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`
        inline-block animate-spin rounded-full
        border-solid border-border
        border-t-primary
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
