import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonListProps {
  /** Number of items to show */
  count?: number;
  /** Custom className */
  className?: string;
  /** Show avatar skeleton */
  showAvatar?: boolean;
  /** Show subtitle */
  showSubtitle?: boolean;
}

/**
 * SkeletonList component for displaying loading state of list items.
 * Useful for tables, lists, and card grids.
 */
export function SkeletonList({
  count = 5,
  className,
  showAvatar = false,
  showSubtitle = true,
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
        >
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            {showSubtitle && <Skeleton className="h-4 w-1/2" />}
          </div>
        </div>
      ))}
    </div>
  );
}
