import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Share2, CheckCircle2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Decision } from "@/api/decisions";

interface DecisionCardProps {
  decision: Decision;
  isSelected?: boolean;
  onSelect?: (decisionId: string, selected: boolean) => void;
  onShare?: (decisionId: string) => void;
  onMarkDecided?: (decisionId: string) => void;
  showCheckbox?: boolean;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-[#FFFBE6] text-[#F6C96B]",
  },
  waiting_for_client: {
    label: "Waiting for Client",
    className: "bg-[#F0F8FF] text-[#6AD8FA]",
  },
  decided: {
    label: "Decided",
    className: "bg-[#F6FDF6] text-[#5FD37B]",
  },
  overdue: {
    label: "Overdue",
    className: "bg-[#F0F8FF] text-[#FF7A7A]",
  },
  archived: {
    label: "Archived",
    className: "bg-[#F4F0FF] text-[#9D79F9]",
  },
};

export function DecisionCard({
  decision,
  isSelected = false,
  onSelect,
  onShare,
  onMarkDecided,
  showCheckbox = false,
}: DecisionCardProps) {
  const status = statusConfig[decision.status] || statusConfig.pending;
  const requiredBy = decision.required_by ? new Date(decision.required_by) : null;
  const isOverdue = requiredBy && requiredBy < new Date() && decision.status !== "decided";

  const handleSelect = (checked: boolean) => {
    onSelect?.(decision.id, checked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(decision.id);
  };

  const handleMarkDecided = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkDecided?.(decision.id);
  };

  return (
    <Card
      className={cn(
        "card-elevated cursor-pointer transition-all duration-200",
        isSelected && "ring-2 ring-primary",
        isOverdue && "border-l-4 border-l-[#FF7A7A]"
      )}
      onClick={() => !showCheckbox && (window.location.href = `/decisions/${decision.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {showCheckbox && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelect}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-1">
                {decision.title}
              </h3>
              {decision.area && (
                <p className="text-sm text-muted-foreground line-clamp-1">{decision.area}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/decisions/${decision.id}`} className="cursor-pointer">
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </DropdownMenuItem>
              {decision.status !== "decided" && (
                <DropdownMenuItem onClick={handleMarkDecided} className="cursor-pointer">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Decided
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {requiredBy && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(requiredBy, "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
          <Badge className={cn("text-xs font-medium", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
