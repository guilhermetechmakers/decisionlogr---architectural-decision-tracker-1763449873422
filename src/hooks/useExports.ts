import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createExport,
  getExport,
  listExports,
  updateExportStatus,
  getExportDownloadUrl,
  deleteExport,
  type ExportParams,
  type ExportUpdate,
} from '@/api/exports';

/**
 * Get a single export
 */
export function useExport(exportId: string | null) {
  return useQuery({
    queryKey: ['export', exportId],
    queryFn: () => getExport(exportId!),
    enabled: !!exportId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * List exports for the current user
 */
export function useExports(params: {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
} = {}) {
  return useQuery({
    queryKey: ['exports', params],
    queryFn: () => listExports(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new export
 */
export function useCreateExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ExportParams) => createExport(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      queryClient.setQueryData(['export', data.id], data);
      toast.success('Export job created. You will be notified when it\'s ready.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create export');
    },
  });
}

/**
 * Update export status
 */
export function useUpdateExportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exportId, updates }: { exportId: string; updates: ExportUpdate }) =>
      updateExportStatus(exportId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      queryClient.setQueryData(['export', data.id], data);
      if (data.status === 'completed') {
        toast.success('Export completed successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update export status');
    },
  });
}

/**
 * Download export file
 */
export function useDownloadExport() {
  return useMutation({
    mutationFn: getExportDownloadUrl,
    onSuccess: (url) => {
      window.open(url, '_blank');
      toast.success('Opening export file...');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download export');
    },
  });
}

/**
 * Delete an export
 */
export function useDeleteExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExport,
    onSuccess: (_, exportId) => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      queryClient.removeQueries({ queryKey: ['export', exportId] });
      toast.success('Export deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete export');
    },
  });
}
