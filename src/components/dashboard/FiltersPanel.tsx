import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Decision } from "@/api/decisions";

interface FiltersPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: Decision["status"] | "all";
  onStatusFilterChange?: (status: Decision["status"] | "all") => void;
  assigneeFilter?: string;
  onAssigneeFilterChange?: (assigneeId: string | "all") => void;
  dateRangeFilter?: "all" | "today" | "week" | "month" | "overdue";
  onDateRangeFilterChange?: (range: "all" | "today" | "week" | "month" | "overdue") => void;
  onClearFilters?: () => void;
  className?: string;
}

export function FiltersPanel({
  searchQuery,
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  assigneeFilter = "all",
  onAssigneeFilterChange,
  dateRangeFilter = "all",
  onDateRangeFilterChange,
  onClearFilters,
  className,
}: FiltersPanelProps) {
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    assigneeFilter !== "all" ||
    dateRangeFilter !== "all";

  const handleClearFilters = () => {
    onSearchChange("");
    onStatusFilterChange?.("all");
    onAssigneeFilterChange?.("all");
    onDateRangeFilterChange?.("all");
    onClearFilters?.();
  };

  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
              <SelectItem value="decided">Decided</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateRange">Date Range</Label>
          <Select value={dateRangeFilter} onValueChange={onDateRangeFilterChange}>
            <SelectTrigger id="dateRange">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
