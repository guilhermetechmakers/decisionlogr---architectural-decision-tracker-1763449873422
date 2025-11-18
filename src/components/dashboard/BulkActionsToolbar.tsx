import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Archive,
  Download,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Decision } from "@/api/decisions";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onSelectAll?: (selected: boolean) => void;
  onDeselectAll?: () => void;
  onBulkStatusChange?: (status: Decision["status"]) => void;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkStatusChange,
  onBulkArchive,
  onBulkDelete,
  onBulkExport,
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "card-elevated sticky top-[73px] z-40 border-primary/20 bg-primary/5",
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCount > 0}
              onCheckedChange={(checked) => onSelectAll?.(!!checked)}
            />
            <span className="text-sm font-medium">
              {selectedCount} {selectedCount === 1 ? "decision" : "decisions"} selected
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => onBulkStatusChange?.(value as Decision["status"])}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
              <SelectItem value="decided">Decided</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <MoreVertical className="h-4 w-4 mr-2" />
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBulkExport} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkArchive} className="cursor-pointer">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkDelete} className="cursor-pointer text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
