import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  searchDecisions,
  getRecentSearchQueries,
  clearCache,
  getCacheStats,
  type SearchParams,
} from '@/api/search';

/**
 * Search decisions with caching
 */
export function useSearch(params: SearchParams | null) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchDecisions(params!),
    enabled: !!params && !!params.query.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Get recent search queries for the current user
 */
export function useRecentSearchQueries(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-search-queries', limit],
    queryFn: () => getRecentSearchQueries(limit),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Clear cache mutation
 */
export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cacheKey?: string) => clearCache(cacheKey),
    onSuccess: (_, cacheKey) => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['cache-stats'] });
      toast.success(cacheKey ? 'Cache cleared' : 'All cache cleared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear cache');
    },
  });
}

/**
 * Get cache statistics
 */
export function useCacheStats() {
  return useQuery({
    queryKey: ['cache-stats'],
    queryFn: () => getCacheStats(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
