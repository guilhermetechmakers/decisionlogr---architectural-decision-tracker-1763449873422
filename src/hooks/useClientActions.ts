import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  validateShareToken,
  verifyShareTokenPasscode,
  confirmChoice,
  askQuestion,
  requestChange,
  getDecisionByShareToken,
  markNotificationRead,
  getUnreadNotifications,
  getAllNotifications,
  type ConfirmChoiceParams,
  type AskQuestionParams,
  type RequestChangeParams,
} from '@/api/client-actions';

/**
 * Validate share token
 */
export function useValidateShareToken(token: string | null) {
  return useQuery({
    queryKey: ['share-token-validation', token],
    queryFn: () => validateShareToken(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Verify share token passcode
 */
export function useVerifyShareTokenPasscode() {
  return useMutation({
    mutationFn: ({ token, passcode }: { token: string; passcode: string }) =>
      verifyShareTokenPasscode(token, passcode),
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid passcode');
    },
  });
}

/**
 * Get decision by share token (for client view)
 */
export function useDecisionByShareToken(token: string | null) {
  return useQuery({
    queryKey: ['decision-by-token', token],
    queryFn: () => getDecisionByShareToken(token!),
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Confirm a decision choice
 */
export function useConfirmChoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ConfirmChoiceParams) => confirmChoice(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['decision-by-token', params.token] });
      queryClient.invalidateQueries({ queryKey: ['decision', params.decisionId] });
      toast.success('Your choice has been confirmed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm choice');
    },
  });
}

/**
 * Ask a question
 */
export function useAskQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AskQuestionParams) => askQuestion(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['decision-by-token', params.token] });
      queryClient.invalidateQueries({ queryKey: ['decision', params.decisionId] });
      toast.success('Your question has been sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send question');
    },
  });
}

/**
 * Request a change
 */
export function useRequestChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RequestChangeParams) => requestChange(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['decision-by-token', params.token] });
      queryClient.invalidateQueries({ queryKey: ['decision', params.decisionId] });
      toast.success('Your change request has been sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send change request');
    },
  });
}

/**
 * Get unread notifications for current user
 */
export function useUnreadNotifications(userId: string | null) {
  return useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => getUnreadNotifications(userId!),
    enabled: !!userId,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    staleTime: 1000 * 10, // 10 seconds
  });
}

/**
 * Get all notifications for current user
 */
export function useNotifications(userId: string | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['notifications', 'all', userId, limit, offset],
    queryFn: () => getAllNotifications(userId!, limit, offset),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Optimistically update the notification
      queryClient.setQueryData(['notifications', 'unread'], (old: any) => {
        if (!old) return old;
        return old.filter((n: any) => n.id !== notificationId);
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });
}
