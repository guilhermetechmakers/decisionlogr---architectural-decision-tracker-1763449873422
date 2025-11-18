import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateShareLink,
  getShareTokensForDecision,
  getShareTokenWithLogs,
  revokeShareToken,
  regenerateShareToken,
  extendShareTokenExpiration,
  getAccessLogs,
  getAccessStatistics,
  logAccessAttempt,
  type GenerateShareLinkParams,
  type AccessLog,
} from '@/api/share-links';

/**
 * Get all share tokens for a decision
 */
export function useShareTokensForDecision(decisionId: string | null) {
  return useQuery({
    queryKey: ['share-tokens', 'decision', decisionId],
    queryFn: () => getShareTokensForDecision(decisionId!),
    enabled: !!decisionId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get share token with access logs
 */
export function useShareTokenWithLogs(tokenId: string | null) {
  return useQuery({
    queryKey: ['share-token', tokenId, 'with-logs'],
    queryFn: () => getShareTokenWithLogs(tokenId!),
    enabled: !!tokenId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get access logs for a share token
 */
export function useAccessLogs(shareTokenId: string | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['access-logs', shareTokenId, limit, offset],
    queryFn: () => getAccessLogs(shareTokenId!, limit, offset),
    enabled: !!shareTokenId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get access statistics for a share token
 */
export function useAccessStatistics(shareTokenId: string | null) {
  return useQuery({
    queryKey: ['access-statistics', shareTokenId],
    queryFn: () => getAccessStatistics(shareTokenId!),
    enabled: !!shareTokenId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Generate a new share link
 */
export function useGenerateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GenerateShareLinkParams) => generateShareLink(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['share-tokens', 'decision', variables.decisionId] });
      queryClient.invalidateQueries({ queryKey: ['decision', variables.decisionId] });
      toast.success('Share link generated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate share link');
    },
  });
}

/**
 * Revoke a share token
 */
export function useRevokeShareToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tokenId: string) => revokeShareToken(tokenId),
    onSuccess: (_, tokenId) => {
      queryClient.invalidateQueries({ queryKey: ['share-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['share-token', tokenId] });
      toast.success('Share link revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke share link');
    },
  });
}

/**
 * Regenerate a share token
 */
export function useRegenerateShareToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      oldTokenId,
      params,
    }: {
      oldTokenId: string;
      params?: Omit<GenerateShareLinkParams, 'decisionId'>;
    }) => regenerateShareToken(oldTokenId, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['share-tokens', 'decision', data.decision_id] });
      queryClient.invalidateQueries({ queryKey: ['decision', data.decision_id] });
      toast.success('Share link regenerated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to regenerate share link');
    },
  });
}

/**
 * Extend share token expiration
 */
export function useExtendShareTokenExpiration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tokenId, newExpiresAt }: { tokenId: string; newExpiresAt: string }) =>
      extendShareTokenExpiration(tokenId, newExpiresAt),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['share-tokens', 'decision', data.decision_id] });
      queryClient.invalidateQueries({ queryKey: ['share-token', data.id] });
      toast.success('Share link expiration extended');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to extend share link expiration');
    },
  });
}

/**
 * Log access attempt
 */
export function useLogAccessAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      shareTokenId: string;
      decisionId: string;
      action: AccessLog['action_taken'];
      clientName?: string;
      clientEmail?: string;
      metadata?: Record<string, any>;
    }) => logAccessAttempt(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['access-logs', data.share_token_id] });
      queryClient.invalidateQueries({ queryKey: ['access-statistics', data.share_token_id] });
      queryClient.invalidateQueries({ queryKey: ['share-token', data.share_token_id, 'with-logs'] });
    },
    onError: (error: Error) => {
      console.error('Failed to log access attempt:', error);
      // Don't show toast for logging errors - it's not critical for user experience
    },
  });
}
