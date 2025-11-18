import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface LoadingPageProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Size of the spinner */
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  /** Custom className */
  className?: string;
}

/**
 * LoadingPage component for displaying full-page loading states.
 * Use this when an entire page is loading (e.g., during route transitions).
 */
export function LoadingPage({
  message = "Loading...",
  spinnerSize = "xl",
  className,
}: LoadingPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-4 bg-background",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <LoadingSpinner size={spinnerSize} />
      {message && (
        <p className="text-base font-medium text-muted-foreground animate-fade-in">
          {message}
        </p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
}
