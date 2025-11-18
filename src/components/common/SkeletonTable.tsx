import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show header */
  showHeader?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * SkeletonTable component for displaying loading state of table content.
 * Matches table structure with header and rows.
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-lg border border-border overflow-hidden">
        {showHeader && (
          <div className="bg-muted/50 border-b border-border p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        )}
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4 grid gap-4 animate-fade-in"
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                animationDelay: `${rowIndex * 50}ms`,
              } as React.CSSProperties}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-3/4" : "w-full"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
