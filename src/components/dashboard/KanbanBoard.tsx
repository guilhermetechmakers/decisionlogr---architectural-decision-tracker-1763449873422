import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DecisionCard } from "./DecisionCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Decision } from "@/api/decisions";

interface KanbanColumn {
  id: Decision["status"];
  title: string;
  color: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  {
    id: "pending",
    title: "Pending",
    color: "#F6C96B",
    bgColor: "#FFFBE6",
  },
  {
    id: "waiting_for_client",
    title: "Waiting for Client",
    color: "#6AD8FA",
    bgColor: "#F0F8FF",
  },
  {
    id: "decided",
    title: "Decided",
    color: "#5FD37B",
    bgColor: "#F6FDF6",
  },
  {
    id: "overdue",
    title: "Overdue",
    color: "#FF7A7A",
    bgColor: "#F0F8FF",
  },
];

interface KanbanBoardProps {
  decisions: Decision[];
  isLoading?: boolean;
  selectedDecisions?: Set<string>;
  onSelectDecision?: (decisionId: string, selected: boolean) => void;
  onShare?: (decisionId: string) => void;
  onMarkDecided?: (decisionId: string) => void;
  showCheckboxes?: boolean;
}

export function KanbanBoard({
  decisions,
  isLoading = false,
  selectedDecisions = new Set(),
  onSelectDecision,
  onShare,
  onMarkDecided,
  showCheckboxes = false,
}: KanbanBoardProps) {
  // Categorize decisions by status and check for overdue
  const categorizedDecisions = useMemo(() => {
    const now = new Date();
    const categorized: Record<string, Decision[]> = {
      pending: [],
      waiting_for_client: [],
      decided: [],
      overdue: [],
    };

    decisions.forEach((decision) => {
      const requiredBy = decision.required_by ? new Date(decision.required_by) : null;
      const isOverdue =
        requiredBy && requiredBy < now && decision.status !== "decided" && decision.status !== "archived";

      if (isOverdue) {
        categorized.overdue.push(decision);
      } else {
        const status = decision.status === "archived" ? "pending" : decision.status;
        if (categorized[status]) {
          categorized[status].push(decision);
        }
      }
    });

    return categorized;
  }, [decisions]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-[18px]" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnDecisions = categorizedDecisions[column.id] || [];
        const count = columnDecisions.length;

        return (
          <div key={column.id} className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <Badge
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: column.bgColor,
                  color: column.color,
                }}
              >
                {count}
              </Badge>
            </div>
            <ScrollArea className="flex-1 min-h-[400px] max-h-[calc(100vh-300px)]">
              <div className="space-y-4 pr-4">
                {columnDecisions.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No decisions
                  </div>
                ) : (
                  columnDecisions.map((decision) => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      isSelected={selectedDecisions.has(decision.id)}
                      onSelect={onSelectDecision}
                      onShare={onShare}
                      onMarkDecided={onMarkDecided}
                      showCheckbox={showCheckboxes}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
