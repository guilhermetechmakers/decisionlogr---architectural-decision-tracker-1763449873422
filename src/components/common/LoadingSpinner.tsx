import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "muted";
  label?: string;
}

export function LoadingSpinner({ 
  className, 
  size = "md",
  variant = "default",
  label 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const variantClasses = {
    default: "border-muted border-t-primary",
    primary: "border-primary/20 border-t-primary",
    muted: "border-muted-foreground/20 border-t-muted-foreground",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label={label || "Loading"}
      aria-live="polite"
    >
      <span className="sr-only">{label || "Loading..."}</span>
    </div>
  );
}
