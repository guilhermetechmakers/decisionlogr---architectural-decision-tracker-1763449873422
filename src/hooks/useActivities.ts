import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listActivities,
  getActivity,
  createActivity,
  getRetentionSettings,
  upsertRetentionSettings,
  exportActivities,
  getActivityStats,
  type ActivityListParams,
  type ActivityInsert,
  type RetentionSettingsInsert,
  type RetentionSettingsUpdate,
  type ExportOptions,
} from '@/api/activities';

/**
 * List activities with filters
 */
export function useActivities(params: ActivityListParams = {}) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get a single activity
 */
export function useActivity(activityId: string | null) {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => getActivity(activityId!),
    enabled: !!activityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create an activity log entry
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: ActivityInsert) => createActivity(activity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['decision', data.decision_id] });
      // Don't show toast for automatic activity logging
    },
    onError: (error: Error) => {
      console.error('Failed to create activity:', error);
      // Don't show toast for automatic activity logging
    },
  });
}

/**
 * Get retention settings for an organization
 */
export function useRetentionSettings(organizationId: string | null) {
  return useQuery({
    queryKey: ['retention-settings', organizationId],
    queryFn: () => getRetentionSettings(organizationId!),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Create or update retention settings
 */
export function useUpsertRetentionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      settings,
    }: {
      organizationId: string;
      settings: RetentionSettingsInsert | RetentionSettingsUpdate;
    }) => upsertRetentionSettings(organizationId, settings),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retention-settings', data.organization_id] });
      toast.success('Retention settings saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save retention settings');
    },
  });
}

/**
 * Export activities
 */
export function useExportActivities() {
  return useMutation({
    mutationFn: (options: ExportOptions) => exportActivities(options),
    onSuccess: ({ url }) => {
      // In production, this would poll for job completion
      // For now, open the URL directly
      window.open(url, '_blank');
      toast.success('Export started. You will be notified when it is ready.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export activities');
    },
  });
}

/**
 * Get activity statistics
 */
export function useActivityStats(params: {
  projectId?: string;
  decisionId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['activity-stats', params],
    queryFn: () => getActivityStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
