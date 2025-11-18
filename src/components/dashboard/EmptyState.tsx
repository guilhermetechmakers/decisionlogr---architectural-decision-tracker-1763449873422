import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel = "Create Decision",
  actionHref = "/decisions/new",
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const defaultIcon = <FileQuestion className="h-12 w-12 text-muted-foreground" />;

  return (
    <Card className={cn("card-elevated border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 text-muted-foreground">
          {icon || defaultIcon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
        {onAction ? (
          <Button onClick={onAction} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        ) : (
          <Button asChild className="rounded-full">
            <Link to={actionHref}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
