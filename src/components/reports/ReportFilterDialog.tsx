import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { Filter } from 'lucide-react';
import type { ReportFilters } from '@/api/reports';

interface ReportFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: ReportFilters) => void;
  initialFilters?: ReportFilters;
}

export function ReportFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  initialFilters = {},
}: ReportFilterDialogProps) {
  const { data: projects } = useProjects();
  const [filters, setFilters] = useState<ReportFilters>({
    projectId: initialFilters.projectId,
    dateRange: initialFilters.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    status: initialFilters.status,
    assigneeId: initialFilters.assigneeId,
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({
      projectId: undefined,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      status: undefined,
      assigneeId: undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Report
          </DialogTitle>
          <DialogDescription className="text-[#7A7A7A]">
            Customize your report by applying filters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium text-[#1A1A1A]">
              Project
            </Label>
            <Select
              value={filters.projectId || ''}
              onValueChange={(value) =>
                setFilters({ ...filters, projectId: value || undefined })
              }
            >
              <SelectTrigger id="project" className="rounded-full">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-xs text-[#7A7A7A]">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange!,
                        start: e.target.value,
                      },
                    })
                  }
                  className="rounded-full"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-xs text-[#7A7A7A]">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange!,
                        end: e.target.value,
                      },
                    })
                  }
                  className="rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-[#1A1A1A]">
              Status
            </Label>
            <Select
              value={filters.status?.[0] || ''}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value ? [value] : undefined,
                })
              }
            >
              <SelectTrigger id="status" className="rounded-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
                <SelectItem value="decided">Decided</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-full"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white hover:scale-105 transition-transform"
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
