import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPerformanceMetrics,
  getSearchIndices,
  getSearchIndex,
  createSearchIndex,
  updateSearchIndex,
  deleteSearchIndex,
  analyzeIndex,
  getQueryPerformanceOverTime,
  type SearchIndexInsert,
  type SearchIndexUpdate,
} from '@/api/performance';

/**
 * Get performance metrics
 */
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => getPerformanceMetrics(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Get all search indices
 */
export function useSearchIndices() {
  return useQuery({
    queryKey: ['search-indices'],
    queryFn: () => getSearchIndices(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single search index
 */
export function useSearchIndex(indexId: string | null) {
  return useQuery({
    queryKey: ['search-index', indexId],
    queryFn: () => getSearchIndex(indexId!),
    enabled: !!indexId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new search index
 */
export function useCreateSearchIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (index: SearchIndexInsert) => createSearchIndex(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-indices'] });
      toast.success('Search index created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create search index');
    },
  });
}

/**
 * Update a search index
 */
export function useUpdateSearchIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ indexId, updates }: { indexId: string; updates: SearchIndexUpdate }) =>
      updateSearchIndex(indexId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['search-indices'] });
      queryClient.setQueryData(['search-index', data.id], data);
      toast.success('Search index updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update search index');
    },
  });
}

/**
 * Delete a search index
 */
export function useDeleteSearchIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSearchIndex,
    onSuccess: (_, indexId) => {
      queryClient.invalidateQueries({ queryKey: ['search-indices'] });
      queryClient.removeQueries({ queryKey: ['search-index', indexId] });
      toast.success('Search index deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete search index');
    },
  });
}

/**
 * Analyze a search index
 */
export function useAnalyzeIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyzeIndex,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['search-indices'] });
      queryClient.setQueryData(['search-index', data.id], data);
      toast.success('Index analyzed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to analyze index');
    },
  });
}

/**
 * Get query performance over time
 */
export function useQueryPerformanceOverTime(days: number = 7) {
  return useQuery({
    queryKey: ['query-performance-over-time', days],
    queryFn: () => getQueryPerformanceOverTime(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
