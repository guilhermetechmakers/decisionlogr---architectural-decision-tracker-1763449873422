import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listUsers,
  getUser,
  suspendUser,
  activateUser,
  resetUserPassword,
  listOrganizationsWithMetrics,
  getAdminOverview,
  listAuditLogs,
  createAuditLog,
  listBillingSubscriptions,
  getBillingSubscription,
  updateBillingSubscription,
  listBillingInvoices,
  listModerationFlags,
  updateModerationFlag,
  revokeShareLink,
  type AuditLogInsert,
  type BillingSubscriptionUpdate,
  type ModerationFlagUpdate,
} from '@/api/admin';
import { supabase } from '@/lib/supabase';

/**
 * Get all users (admin only)
 */
export function useUsers(filters?: {
  search?: string;
  role?: string;
  status?: 'active' | 'suspended';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => listUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get a single user (admin only)
 */
export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Suspend a user
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      suspendUser(userId, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      toast.success('User suspended successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to suspend user');
    },
  });
}

/**
 * Activate a user
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      toast.success('User activated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate user');
    },
  });
}

/**
 * Reset user password
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
}

/**
 * Get organizations with metrics
 */
export function useOrganizationsWithMetrics() {
  return useQuery({
    queryKey: ['admin', 'organizations', 'metrics'],
    queryFn: listOrganizationsWithMetrics,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get admin dashboard overview
 */
export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getAdminOverview,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Get audit logs
 */
export function useAuditLogs(filters?: {
  action_type?: string;
  user_id?: string;
  resource_type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'audit_logs', filters],
    queryFn: () => listAuditLogs(filters),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Create audit log entry
 */
export function useCreateAuditLog() {
  return useMutation({
    mutationFn: (log: AuditLogInsert) => createAuditLog(log),
    onError: (error: Error) => {
      console.error('Failed to create audit log:', error);
    },
  });
}

/**
 * Get billing subscriptions
 */
export function useBillingSubscriptions(orgId?: string) {
  return useQuery({
    queryKey: ['admin', 'billing', 'subscriptions', orgId],
    queryFn: () => listBillingSubscriptions(orgId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get a single billing subscription
 */
export function useBillingSubscription(subscriptionId: string | null) {
  return useQuery({
    queryKey: ['admin', 'billing', 'subscription', subscriptionId],
    queryFn: () => getBillingSubscription(subscriptionId!),
    enabled: !!subscriptionId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Update billing subscription
 */
export function useUpdateBillingSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, updates }: { subscriptionId: string; updates: BillingSubscriptionUpdate }) =>
      updateBillingSubscription(subscriptionId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing', 'subscriptions'] });
      queryClient.setQueryData(['admin', 'billing', 'subscription', data.id], data);
      toast.success('Subscription updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription');
    },
  });
}

/**
 * Get billing invoices
 */
export function useBillingInvoices(subscriptionId?: string, orgId?: string) {
  return useQuery({
    queryKey: ['admin', 'billing', 'invoices', subscriptionId, orgId],
    queryFn: () => listBillingInvoices(subscriptionId, orgId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get moderation flags
 */
export function useModerationFlags(filters?: {
  status?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'moderation', 'flags', filters],
    queryFn: () => listModerationFlags(filters),
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Update moderation flag
 */
export function useUpdateModerationFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flagId, updates }: { flagId: string; updates: ModerationFlagUpdate }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      return updateModerationFlag(flagId, updates, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation', 'flags'] });
      toast.success('Moderation flag updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update moderation flag');
    },
  });
}

/**
 * Revoke share link
 */
export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareTokenId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      return revokeShareLink(shareTokenId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
      toast.success('Share link revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke share link');
    },
  });
}
