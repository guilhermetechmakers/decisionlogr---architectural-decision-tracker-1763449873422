import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  FileQuestion, 
  Inbox, 
  Search, 
  FolderOpen, 
  AlertCircle,
  Plus,
  RefreshCw
} from "lucide-react";

export type EmptyStateVariant = 
  | "default"
  | "no-results"
  | "no-items"
  | "error"
  | "search"
  | "folder";

interface EmptyStateProps {
  /** Icon to display (optional, will use default based on variant) */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Variant for default icon and styling */
  variant?: EmptyStateVariant;
  /** Custom className */
  className?: string;
  /** Custom illustration/image */
  illustration?: ReactNode;
}

const defaultIcons: Record<EmptyStateVariant, ReactNode> = {
  default: <FileQuestion className="h-16 w-16 text-muted-foreground" />,
  "no-results": <Search className="h-16 w-16 text-muted-foreground" />,
  "no-items": <Inbox className="h-16 w-16 text-muted-foreground" />,
  error: <AlertCircle className="h-16 w-16 text-destructive" />,
  search: <Search className="h-16 w-16 text-muted-foreground" />,
  folder: <FolderOpen className="h-16 w-16 text-muted-foreground" />,
};

/**
 * EmptyState component for displaying helpful empty states with illustrations,
 * guidance text, and clear calls-to-action.
 * Follows the design system with rounded cards, soft colors, and proper spacing.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
  illustration,
}: EmptyStateProps) {
  const displayIcon = icon || illustration || defaultIcons[variant];

  return (
    <Card 
      className={cn(
        "card-elevated border-dashed border-2",
        variant === "error" && "border-destructive/20",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Icon/Illustration */}
        <div 
          className={cn(
            "mb-6 animate-fade-in",
            variant === "error" && "text-destructive"
          )}
        >
          {displayIcon}
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-xl font-bold mb-3 text-foreground animate-fade-in",
          "md:text-2xl"
        )} style={{ animationDelay: "100ms" }}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p 
            className={cn(
              "text-sm text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in",
              "md:text-base"
            )}
            style={{ animationDelay: "200ms" }}
          >
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div 
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            {action && (
              <Button 
                onClick={action.onClick}
                className="rounded-full"
                size="lg"
              >
                {action.icon || <Plus className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button 
                onClick={secondaryAction.onClick}
                variant="outline"
                className="rounded-full"
                size="lg"
              >
                {secondaryAction.icon || <RefreshCw className="h-4 w-4 mr-2" />}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
