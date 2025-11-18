import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '@/hooks/useActivities';
import { EnhancedNavbar } from '@/components/dashboard/EnhancedNavbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ExportModal } from '@/components/activities/ExportModal';
import { FilterDialog } from '@/components/activities/FilterDialog';
import {
  Download,
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  MessageSquare,
  Share2,
  Archive,
  RefreshCw,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ActivityWithActor } from '@/api/activities';

const actionTypeConfig: Record<
  ActivityWithActor['action_type'],
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  created: {
    label: 'Created',
    color: '#5FD37B',
    bgColor: '#F6FDF6',
    icon: <FileText className="h-4 w-4" />,
  },
  updated: {
    label: 'Updated',
    color: '#6AD8FA',
    bgColor: '#F0F8FF',
    icon: <RefreshCw className="h-4 w-4" />,
  },
  archived: {
    label: 'Archived',
    color: '#7A7A7A',
    bgColor: '#F7FAFC',
    icon: <Archive className="h-4 w-4" />,
  },
  shared: {
    label: 'Shared',
    color: '#9D79F9',
    bgColor: '#F4F0FF',
    icon: <Share2 className="h-4 w-4" />,
  },
  commented: {
    label: 'Commented',
    color: '#6AD8FA',
    bgColor: '#F0F8FF',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  client_question: {
    label: 'Client Question',
    color: '#F6C96B',
    bgColor: '#FFFBE6',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  client_change_request: {
    label: 'Change Request',
    color: '#F6C96B',
    bgColor: '#FFFBE6',
    icon: <FileText className="h-4 w-4" />,
  },
  client_confirmed: {
    label: 'Confirmed',
    color: '#5FD37B',
    bgColor: '#F6FDF6',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  exported: {
    label: 'Exported',
    color: '#9D79F9',
    bgColor: '#F4F0FF',
    icon: <Download className="h-4 w-4" />,
  },
  reminder_sent: {
    label: 'Reminder Sent',
    color: '#6AD8FA',
    bgColor: '#F0F8FF',
    icon: <Calendar className="h-4 w-4" />,
  },
  link_regenerated: {
    label: 'Link Regenerated',
    color: '#9D79F9',
    bgColor: '#F4F0FF',
    icon: <Share2 className="h-4 w-4" />,
  },
};

export default function ActivityHistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<{
    actionType?: ActivityWithActor['action_type'];
    actorId?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const { data: activities = [], isLoading } = useActivities({
    actionType: filters.actionType,
    actorId: filters.actorId,
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: 100,
  });

  const filteredActivities = useMemo(() => {
    if (!searchQuery) return activities;

    const query = searchQuery.toLowerCase();
    return activities.filter((activity) => {
      const decisionTitle = activity.decision?.title?.toLowerCase() || '';
      const actorName = activity.actor?.full_name?.toLowerCase() || '';
      const actionType = actionTypeConfig[activity.action_type]?.label.toLowerCase() || '';

      return (
        decisionTitle.includes(query) ||
        actorName.includes(query) ||
        actionType.includes(query)
      );
    });
  }, [activities, searchQuery]);

  const handleSelectActivity = (activityId: string, selected: boolean) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(activityId);
      } else {
        next.delete(activityId);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedActivities(new Set(filteredActivities.map((a) => a.id)));
    } else {
      setSelectedActivities(new Set());
    }
  };

  const handleExport = () => {
    if (selectedActivities.size > 0) {
      setShowExportModal(true);
    } else {
      // Export all filtered activities
      setShowExportModal(true);
    }
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <EnhancedNavbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Activity History</h1>
          <p className="text-[#7A7A7A]">
            Comprehensive audit trail of all actions and changes in your decisions
          </p>
        </div>

        {/* Toolbar */}
        <Card className="p-4 mb-6 bg-white rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-lg border-[#E5E7EB] focus:border-[#9D79F9]"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(true)}
                className="rounded-full border-[#E5E7EB]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-[#9D79F9] text-white text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <Button
                onClick={handleExport}
                disabled={filteredActivities.length === 0}
                className="rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-wrap gap-2">
              {filters.actionType && (
                <Badge
                  variant="outline"
                  className="rounded-full bg-[#F4F0FF] text-[#9D79F9] border-[#9D79F9]"
                >
                  {actionTypeConfig[filters.actionType]?.label}
                  <button
                    onClick={() => setFilters({ ...filters, actionType: undefined })}
                    className="ml-2 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.startDate && (
                <Badge
                  variant="outline"
                  className="rounded-full bg-[#F0F8FF] text-[#6AD8FA] border-[#6AD8FA]"
                >
                  From: {format(new Date(filters.startDate), 'MMM d, yyyy')}
                  <button
                    onClick={() => setFilters({ ...filters, startDate: undefined })}
                    className="ml-2 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.endDate && (
                <Badge
                  variant="outline"
                  className="rounded-full bg-[#F0F8FF] text-[#6AD8FA] border-[#6AD8FA]"
                >
                  To: {format(new Date(filters.endDate), 'MMM d, yyyy')}
                  <button
                    onClick={() => setFilters({ ...filters, endDate: undefined })}
                    className="ml-2 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Activity Table */}
        <Card className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-[#7A7A7A] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No activities found</h3>
              <p className="text-[#7A7A7A]">
                {searchQuery || activeFiltersCount > 0
                  ? 'Try adjusting your search or filters'
                  : 'Activities will appear here as actions are taken'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E5E7EB]">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredActivities.length > 0 &&
                          filteredActivities.every((a) => selectedActivities.has(a.id))
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-[#7A7A7A] font-medium">Timestamp</TableHead>
                    <TableHead className="text-[#7A7A7A] font-medium">Action</TableHead>
                    <TableHead className="text-[#7A7A7A] font-medium">Decision</TableHead>
                    <TableHead className="text-[#7A7A7A] font-medium">Actor</TableHead>
                    <TableHead className="text-[#7A7A7A] font-medium">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const config = actionTypeConfig[activity.action_type];
                    return (
                      <TableRow
                        key={activity.id}
                        className="border-[#E5E7EB] hover:bg-[#F7FAFC] cursor-pointer"
                        onClick={() => navigate(`/decisions/${activity.decision_id}`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedActivities.has(activity.id)}
                            onCheckedChange={(checked) =>
                              handleSelectActivity(activity.id, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-[#7A7A7A]">
                          {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="rounded-full flex items-center gap-1.5 w-fit"
                            style={{
                              color: config.color,
                              backgroundColor: config.bgColor,
                              borderColor: config.color,
                            }}
                          >
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-[#1A1A1A]">
                            {activity.decision?.title || 'Unknown Decision'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {activity.actor ? (
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-[#F4F0FF] flex items-center justify-center">
                                <User className="h-4 w-4 text-[#9D79F9]" />
                              </div>
                              <div>
                                <div className="font-medium text-[#1A1A1A] text-sm">
                                  {activity.actor.full_name}
                                </div>
                                <div className="text-xs text-[#7A7A7A]">{activity.actor.email}</div>
                              </div>
                            </div>
                          ) : activity.actor_meta?.email ? (
                            <div className="text-sm text-[#7A7A7A]">
                              {activity.actor_meta.email} (Guest)
                            </div>
                          ) : (
                            <span className="text-sm text-[#7A7A7A]">Guest</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-[#7A7A7A]">
                          {JSON.stringify(activity.payload).length > 50
                            ? `${JSON.stringify(activity.payload).substring(0, 50)}...`
                            : JSON.stringify(activity.payload)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Export Modal */}
        <ExportModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          activityIds={
            selectedActivities.size > 0 ? Array.from(selectedActivities) : undefined
          }
          startDate={filters.startDate}
          endDate={filters.endDate}
        />

        {/* Filter Dialog */}
        <FilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </div>
  );
}
