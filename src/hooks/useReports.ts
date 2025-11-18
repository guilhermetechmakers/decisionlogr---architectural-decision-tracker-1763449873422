import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateAggregateCountsReport,
  generateOverdueDecisionsReport,
  generateTimeToDecisionReport,
  getReport,
  listReports,
  deleteReport,
  type ReportFilters,
} from '@/api/reports';

/**
 * Get a single report
 */
export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => getReport(reportId!),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * List reports for the current user
 */
export function useReports(params: {
  limit?: number;
  offset?: number;
  metricType?: 'aggregate_counts' | 'overdue_decisions' | 'time_to_decision' | 'custom';
} = {}) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => listReports(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Generate aggregate counts report
 */
export function useGenerateAggregateCountsReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters?: ReportFilters) => generateAggregateCountsReport(filters),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.setQueryData(['report', data.id], data);
      toast.success('Aggregate counts report generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });
}

/**
 * Generate overdue decisions report
 */
export function useGenerateOverdueDecisionsReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters?: ReportFilters) => generateOverdueDecisionsReport(filters),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.setQueryData(['report', data.id], data);
      toast.success('Overdue decisions report generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });
}

/**
 * Generate time-to-decision report
 */
export function useGenerateTimeToDecisionReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters?: ReportFilters) => generateTimeToDecisionReport(filters),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.setQueryData(['report', data.id], data);
      toast.success('Time to decision report generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });
}

/**
 * Delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.removeQueries({ queryKey: ['report', reportId] });
      toast.success('Report deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete report');
    },
  });
}
