import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Whether to show a semi-transparent backdrop */
  withBackdrop?: boolean;
  /** Size of the spinner */
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  /** Custom className */
  className?: string;
  /** Full page overlay (fixed positioning) */
  fullPage?: boolean;
}

/**
 * LoadingOverlay component for displaying loading states with a spinner and optional message.
 * Can be used as a full-page overlay or within a container.
 */
export function LoadingOverlay({
  message,
  withBackdrop = true,
  spinnerSize = "lg",
  className,
  fullPage = false,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullPage
          ? "fixed inset-0 z-50"
          : "absolute inset-0 z-10",
        withBackdrop && "bg-background/80 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <LoadingSpinner size={spinnerSize} />
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-fade-in">
          {message}
        </p>
      )}
      <span className="sr-only">{message || "Loading..."}</span>
    </div>
  );
}
