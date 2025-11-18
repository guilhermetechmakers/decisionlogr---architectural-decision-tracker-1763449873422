import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCurrentTermsOfService,
  getTermsOfServiceByVersion,
  recordUserAcceptance,
  checkUserAcceptanceStatus,
  getUserAcceptanceHistory,
} from '@/api/terms';

/**
 * Query key factory for Terms of Service queries
 */
export const termsKeys = {
  all: ['terms'] as const,
  current: () => [...termsKeys.all, 'current'] as const,
  version: (version: string) => [...termsKeys.all, 'version', version] as const,
  acceptanceStatus: () => [...termsKeys.all, 'acceptance-status'] as const,
  acceptanceHistory: () => [...termsKeys.all, 'acceptance-history'] as const,
};

/**
 * Hook to fetch the current active Terms of Service
 */
export function useCurrentTermsOfService() {
  return useQuery({
    queryKey: termsKeys.current(),
    queryFn: async () => {
      const response = await getCurrentTermsOfService();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch Terms of Service');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook to fetch a specific Terms of Service version
 */
export function useTermsOfServiceByVersion(version: string) {
  return useQuery({
    queryKey: termsKeys.version(version),
    queryFn: async () => {
      const response = await getTermsOfServiceByVersion(version);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch Terms of Service');
      }
      return response.data;
    },
    enabled: !!version,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to check if user needs to accept Terms of Service
 */
export function useAcceptanceStatus() {
  return useQuery({
    queryKey: termsKeys.acceptanceStatus(),
    queryFn: async () => {
      const response = await checkUserAcceptanceStatus();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get user's acceptance history
 */
export function useAcceptanceHistory() {
  return useQuery({
    queryKey: termsKeys.acceptanceHistory(),
    queryFn: async () => {
      return await getUserAcceptanceHistory();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to record user acceptance of Terms of Service
 */
export function useRecordAcceptance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      version,
      method = 'manual',
      metadata,
    }: {
      version: string;
      method?: 'signup' | 'post-update' | 'manual';
      metadata?: Record<string, any>;
    }) => {
      const response = await recordUserAcceptance(version, method, metadata);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to record acceptance');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: termsKeys.acceptanceStatus() });
      queryClient.invalidateQueries({ queryKey: termsKeys.acceptanceHistory() });
      
      toast.success('Terms of Service accepted', {
        description: 'Thank you for accepting our Terms of Service.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to accept Terms of Service', {
        description: error.message,
      });
    },
  });
}
