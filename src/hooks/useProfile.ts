import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
  getNotificationPreferences,
  updateNotificationPreferences,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  getOAuthConnections,
  disconnectOAuth,
  deleteOAuthConnection,
} from '@/api/profile';
import type {
  UserProfileUpdate,
  NotificationPreferencesUpdate,
} from '@/types/profile';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'user'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
  notifications: () => [...profileKeys.all, 'notifications'] as const,
  apiKeys: () => [...profileKeys.all, 'api-keys'] as const,
  oauth: () => [...profileKeys.all, 'oauth'] as const,
};

// =====================================================
// User Profile Hooks
// =====================================================

/**
 * Get current user's profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update user profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UserProfileUpdate) => updateUserProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

/**
 * Update password mutation
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      updatePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update password: ${error.message}`);
    },
  });
}

// =====================================================
// User Sessions Hooks
// =====================================================

/**
 * Get user sessions
 */
export function useUserSessions() {
  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: getUserSessions,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Revoke session mutation
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      toast.success('Session revoked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke session: ${error.message}`);
    },
  });
}

/**
 * Revoke all other sessions mutation
 */
export function useRevokeAllOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
      toast.success('All other sessions revoked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke sessions: ${error.message}`);
    },
  });
}

// =====================================================
// Notification Preferences Hooks
// =====================================================

/**
 * Get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: profileKeys.notifications(),
    queryFn: getNotificationPreferences,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update notification preferences mutation
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: NotificationPreferencesUpdate) =>
      updateNotificationPreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.notifications() });
      toast.success('Notification preferences updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });
}

// =====================================================
// API Keys Hooks
// =====================================================

/**
 * Get API keys
 */
export function useApiKeys() {
  return useQuery({
    queryKey: profileKeys.apiKeys(),
    queryFn: getApiKeys,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create API key mutation
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyName: string) => createApiKey(keyName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
      toast.success('API key created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create API key: ${error.message}`);
    },
  });
}

/**
 * Revoke API key mutation
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => revokeApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
      toast.success('API key revoked');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke API key: ${error.message}`);
    },
  });
}

/**
 * Delete API key mutation
 */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys() });
      toast.success('API key deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete API key: ${error.message}`);
    },
  });
}

// =====================================================
// OAuth Connections Hooks
// =====================================================

/**
 * Get OAuth connections
 */
export function useOAuthConnections() {
  return useQuery({
    queryKey: profileKeys.oauth(),
    queryFn: getOAuthConnections,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Disconnect OAuth mutation
 */
export function useDisconnectOAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => disconnectOAuth(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.oauth() });
      toast.success('OAuth connection disconnected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });
}

/**
 * Delete OAuth connection mutation
 */
export function useDeleteOAuthConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => deleteOAuthConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.oauth() });
      toast.success('OAuth connection deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete connection: ${error.message}`);
    },
  });
}
