import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDecision,
  listDecisions,
  createDecision,
  updateDecision,
  archiveDecision,
  markDecisionDecided,
  updateOption,
  createComment,
  getOrCreateShareToken,
  exportDecisionToPDF,
  sendReminder,
  type DecisionListParams,
  type DecisionInsert,
  type OptionInsert,
  type DecisionUpdate,
  type OptionUpdate,
  type CommentInsert,
} from '@/api/decisions';

/**
 * Get a single decision with all relations
 */
export function useDecision(decisionId: string | null) {
  return useQuery({
    queryKey: ['decision', decisionId],
    queryFn: () => getDecision(decisionId!),
    enabled: !!decisionId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * List decisions with filters
 */
export function useDecisions(params: DecisionListParams = {}) {
  return useQuery({
    queryKey: ['decisions', params],
    queryFn: () => listDecisions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new decision
 */
export function useCreateDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ decision, options }: { decision: DecisionInsert; options: OptionInsert[] }) =>
      createDecision(decision, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.setQueryData(['decision', data.id], data);
      toast.success('Decision created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create decision');
    },
  });
}

/**
 * Update a decision
 */
export function useUpdateDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ decisionId, updates }: { decisionId: string; updates: DecisionUpdate }) =>
      updateDecision(decisionId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.setQueryData(['decision', data.id], data);
      toast.success('Decision updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update decision');
    },
  });
}

/**
 * Archive a decision
 */
export function useArchiveDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveDecision,
    onSuccess: (_, decisionId) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.removeQueries({ queryKey: ['decision', decisionId] });
      toast.success('Decision archived');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive decision');
    },
  });
}

/**
 * Mark decision as decided
 */
export function useMarkDecisionDecided() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ decisionId, optionId }: { decisionId: string; optionId: string }) =>
      markDecisionDecided(decisionId, optionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.setQueryData(['decision', data.id], data);
      toast.success('Decision marked as decided');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark decision as decided');
    },
  });
}

/**
 * Update an option
 */
export function useUpdateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ optionId, updates }: { optionId: string; updates: OptionUpdate }) =>
      updateOption(optionId, updates),
    onSuccess: () => {
      // Invalidate decision query to refresh options
      queryClient.invalidateQueries({ queryKey: ['decision'] });
      toast.success('Option updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update option');
    },
  });
}

/**
 * Create a comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: CommentInsert) => createComment(comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['decision', data.decision_id] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

/**
 * Get or create share token
 */
export function useShareToken(decisionId: string | null) {
  return useQuery({
    queryKey: ['share-token', decisionId],
    queryFn: () => getOrCreateShareToken(decisionId!),
    enabled: !!decisionId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Export decision to PDF
 */
export function useExportDecision() {
  return useMutation({
    mutationFn: exportDecisionToPDF,
    onSuccess: ({ url }) => {
      window.open(url, '_blank');
      toast.success('PDF export started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export decision');
    },
  });
}

/**
 * Send reminder
 */
export function useSendReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendReminder,
    onSuccess: (_, decisionId) => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] });
      toast.success('Reminder sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reminder');
    },
  });
}
