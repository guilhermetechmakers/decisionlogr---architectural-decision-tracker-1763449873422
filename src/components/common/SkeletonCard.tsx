import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface SkeletonCardProps {
  /** Show header skeleton */
  showHeader?: boolean;
  /** Number of content lines */
  lines?: number;
  /** Custom className */
  className?: string;
  /** Show footer skeleton */
  showFooter?: boolean;
  /** Custom style */
  style?: CSSProperties;
}

/**
 * SkeletonCard component for displaying loading state of card content.
 * Matches the design system card styling.
 */
export function SkeletonCard({
  showHeader = true,
  lines = 3,
  className,
  showFooter = false,
  style,
}: SkeletonCardProps) {
  return (
    <Card className={cn("card-elevated", className)} style={style}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )}
          />
        ))}
      </CardContent>
      {showFooter && (
        <div className="p-6 pt-0 space-y-2">
          <Skeleton className="h-4 w-1/4" />
        </div>
      )}
    </Card>
  );
}
