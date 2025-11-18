import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedNavbar } from "@/components/dashboard/EnhancedNavbar";
import { ProjectSelector } from "@/components/dashboard/ProjectSelector";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { BulkActionsToolbar } from "@/components/dashboard/BulkActionsToolbar";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { useDecisions, useUpdateDecision, useArchiveDecision } from "@/hooks/useDecision";
import { getOrCreateShareToken } from "@/api/decisions";
import { toast } from "sonner";
import type { Decision } from "@/api/decisions";
import { format, isBefore, startOfToday, startOfWeek, startOfMonth } from "date-fns";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Decision["status"] | "all">("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "today" | "week" | "month" | "overdue">("all");
  const [selectedDecisions, setSelectedDecisions] = useState<Set<string>>(new Set());
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  const updateDecision = useUpdateDecision();
  const archiveDecision = useArchiveDecision();

  // Fetch decisions with filters
  const { data: decisions = [], isLoading } = useDecisions({
    projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  // Apply date range filter
  const filteredDecisions = useMemo(() => {
    if (dateRangeFilter === "all") return decisions;

    const now = new Date();
    const today = startOfToday();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    return decisions.filter((decision) => {
      if (!decision.required_by) return false;
      const requiredBy = new Date(decision.required_by);

      switch (dateRangeFilter) {
        case "today":
          return format(requiredBy, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        case "week":
          return requiredBy >= weekStart && requiredBy <= now;
        case "month":
          return requiredBy >= monthStart && requiredBy <= now;
        case "overdue":
          return isBefore(requiredBy, today) && decision.status !== "decided";
        default:
          return true;
      }
    });
  }, [decisions, dateRangeFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedDecisions(new Set()); // Clear selection when changing projects
  };

  const handleSelectDecision = (decisionId: string, selected: boolean) => {
    setSelectedDecisions((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(decisionId);
      } else {
        next.delete(decisionId);
      }
      return next;
    });
    if (!showCheckboxes && selectedDecisions.size === 0 && selected) {
      setShowCheckboxes(true);
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDecisions(new Set(filteredDecisions.map((d) => d.id)));
      setShowCheckboxes(true);
    } else {
      setSelectedDecisions(new Set());
      setShowCheckboxes(false);
    }
  };

  const handleDeselectAll = () => {
    setSelectedDecisions(new Set());
    setShowCheckboxes(false);
  };

  const handleShare = async (decisionId: string) => {
    try {
      const shareToken = await getOrCreateShareToken(decisionId);
      if (shareToken) {
        const shareUrl = `${window.location.origin}/share/${shareToken.token}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const handleMarkDecided = async (decisionId: string) => {
    // This would typically open a dialog to select the final option
    // For now, just update status
    try {
      await updateDecision.mutateAsync({
        decisionId,
        updates: { status: "decided" },
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkStatusChange = async (status: Decision["status"]) => {
    const promises = Array.from(selectedDecisions).map((decisionId) =>
      updateDecision.mutateAsync({
        decisionId,
        updates: { status },
      })
    );

    try {
      await Promise.all(promises);
      toast.success(`Updated ${selectedDecisions.size} decisions`);
      setSelectedDecisions(new Set());
      setShowCheckboxes(false);
    } catch (error) {
      toast.error("Failed to update some decisions");
    }
  };

  const handleBulkArchive = async () => {
    const promises = Array.from(selectedDecisions).map((decisionId) =>
      archiveDecision.mutateAsync(decisionId)
    );

    try {
      await Promise.all(promises);
      toast.success(`Archived ${selectedDecisions.size} decisions`);
      setSelectedDecisions(new Set());
      setShowCheckboxes(false);
    } catch (error) {
      toast.error("Failed to archive some decisions");
    }
  };

  const handleBulkDelete = async () => {
    // In production, this would be a soft delete or require confirmation
    toast.info("Delete functionality requires confirmation dialog");
  };

  const handleBulkExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleNewDecision = () => {
    navigate("/decisions/new");
  };

  const handleProjectCreated = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowCreateProject(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavbar
        onSearch={handleSearch}
        onNewDecision={handleNewDecision}
      />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Architect Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your architectural decisions and track client feedback
            </p>
          </div>
          <ProjectSelector
            value={selectedProjectId}
            onValueChange={handleProjectChange}
            onCreateNew={() => setShowCreateProject(true)}
          />
        </div>

        {/* Filters Panel */}
        <div className="mb-6">
          <FiltersPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={(status) => setStatusFilter(status as Decision["status"] | "all")}
            dateRangeFilter={dateRangeFilter}
            onDateRangeFilterChange={setDateRangeFilter}
            onClearFilters={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setDateRangeFilter("all");
            }}
          />
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedDecisions.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedDecisions.size}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            className="mb-6"
          />
        )}

        {/* Kanban Board */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-muted animate-pulse rounded-[18px]" />
                ))}
              </div>
            ))}
          </div>
        ) : filteredDecisions.length === 0 ? (
          <EmptyState
            title="No decisions found"
            description={
              searchQuery || statusFilter !== "all" || dateRangeFilter !== "all"
                ? "Try adjusting your filters to see more decisions."
                : "Get started by creating your first architectural decision. Track options, share with clients, and make informed choices."
            }
            actionLabel="Create Decision"
            onAction={handleNewDecision}
          />
        ) : (
          <KanbanBoard
            decisions={filteredDecisions}
            isLoading={isLoading}
            selectedDecisions={selectedDecisions}
            onSelectDecision={handleSelectDecision}
            onShare={handleShare}
            onMarkDecided={handleMarkDecided}
            showCheckboxes={showCheckboxes}
          />
        )}
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}
