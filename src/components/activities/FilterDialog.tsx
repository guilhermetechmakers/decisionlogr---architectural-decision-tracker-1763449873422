import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Activity } from '@/api/activities';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    actionType?: Activity['action_type'];
    actorId?: string;
    startDate?: string;
    endDate?: string;
  };
  onFiltersChange: (filters: {
    actionType?: Activity['action_type'];
    actorId?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

const actionTypes: Activity['action_type'][] = [
  'created',
  'updated',
  'archived',
  'shared',
  'commented',
  'client_question',
  'client_change_request',
  'client_confirmed',
  'exported',
  'reminder_sent',
  'link_regenerated',
];

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = {
      actionType: undefined,
      actorId: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
            Filter Activities
          </DialogTitle>
          <DialogDescription className="text-[#7A7A7A]">
            Refine your activity history by applying filters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="actionType" className="text-sm font-medium text-[#1A1A1A]">
              Action Type
            </Label>
            <Select
              value={localFilters.actionType || 'all'}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  actionType: value === 'all' ? undefined : (value as Activity['action_type']),
                })
              }
            >
              <SelectTrigger id="actionType" className="rounded-lg">
                <SelectValue placeholder="All action types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All action types</SelectItem>
                {actionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-[#1A1A1A]">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, startDate: e.target.value || undefined })
              }
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-[#1A1A1A]">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, endDate: e.target.value || undefined })
              }
              className="rounded-lg"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset} className="rounded-full">
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
