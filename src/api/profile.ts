import { supabase } from '@/lib/supabase';
import type {
  UserProfile,
  UserProfileUpdate,
  UserSession,
  NotificationPreferences,
  NotificationPreferencesUpdate,
  ApiKey,
  ApiKeyInsert,
  OAuthConnection,
} from '@/types/profile';

// =====================================================
// User Profile Operations
// =====================================================

/**
 * Get current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: UserProfileUpdate): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user password
 */
export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(`Failed to update password: ${error.message}`);
  }
}

// =====================================================
// User Sessions Operations
// =====================================================

/**
 * Get current user's active sessions
 */
export async function getUserSessions(): Promise<UserSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  return data || [];
}

/**
 * Revoke a session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to revoke session: ${error.message}`);
  }
}

/**
 * Revoke all other sessions (keep current)
 */
export async function revokeAllOtherSessions(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get current session token (simplified - in production, track this properly)
  const currentToken = session.access_token;

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .neq('session_token', currentToken);

  if (error) {
    throw new Error(`Failed to revoke sessions: ${error.message}`);
  }
}

// =====================================================
// Notification Preferences Operations
// =====================================================

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If no preferences exist, return defaults
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch preferences: ${error.message}`);
  }

  return data;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  updates: NotificationPreferencesUpdate
): Promise<NotificationPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try to update first
  const { data, error: updateError } = await supabase
    .from('notification_preferences')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    // If record doesn't exist, create it
    if (updateError.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: user.id, ...updates })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create preferences: ${insertError.message}`);
      }

      return newData;
    }

    throw new Error(`Failed to update preferences: ${updateError.message}`);
  }

  return data;
}

// =====================================================
// API Keys Operations
// =====================================================

/**
 * Get user's API keys
 */
export async function getApiKeys(): Promise<ApiKey[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new API key
 * Note: In production, generate and hash the key properly
 */
export async function createApiKey(keyName: string): Promise<{ key: ApiKey; plainKey: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Generate API key (in production, use proper crypto)
  const plainKey = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;
  const keyPrefix = plainKey.substring(0, 12);
  
  // Hash the key (in production, use proper hashing like bcrypt)
  // For now, we'll store a simple hash - this should be done server-side in production
  const keyHash = await hashString(plainKey);

  const keyData: ApiKeyInsert = {
    user_id: user.id,
    key_name: keyName,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('api_keys')
    .insert(keyData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return { key: data, plainKey };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to revoke API key: ${error.message}`);
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(keyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
}

// Helper function to hash strings (simplified - use proper crypto in production)
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =====================================================
// OAuth Connections Operations
// =====================================================

/**
 * Get user's OAuth connections
 */
export async function getOAuthConnections(): Promise<OAuthConnection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', user.id)
    .order('connected_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch OAuth connections: ${error.message}`);
  }

  return data || [];
}

/**
 * Disconnect an OAuth provider
 */
export async function disconnectOAuth(connectionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('oauth_connections')
    .update({ is_active: false })
    .eq('id', connectionId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to disconnect OAuth: ${error.message}`);
  }
}

/**
 * Delete an OAuth connection
 */
export async function deleteOAuthConnection(connectionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('oauth_connections')
    .delete()
    .eq('id', connectionId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete OAuth connection: ${error.message}`);
  }
}
