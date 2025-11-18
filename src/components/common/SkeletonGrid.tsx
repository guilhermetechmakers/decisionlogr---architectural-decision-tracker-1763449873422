import { SkeletonCard } from "./SkeletonCard";
import { cn } from "@/lib/utils";

interface SkeletonGridProps {
  /** Number of cards to show */
  count?: number;
  /** Custom className */
  className?: string;
  /** Show header in cards */
  showHeader?: boolean;
  /** Number of content lines per card */
  lines?: number;
  /** Grid columns (responsive) - use Tailwind grid classes */
  columns?: string;
}

/**
 * SkeletonGrid component for displaying loading state of card grids.
 * Responsive grid layout matching the design system.
 * 
 * @example
 * <SkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
 */
export function SkeletonGrid({
  count = 6,
  className,
  showHeader = true,
  lines = 3,
  columns = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
}: SkeletonGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns,
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          showHeader={showHeader}
          lines={lines}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}
