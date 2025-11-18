/**
 * Profile-related types
 */

import type { Database } from './database';

// User Profile types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// User Session types
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type UserSessionInsert = Database['public']['Tables']['user_sessions']['Insert'];
export type UserSessionUpdate = Database['public']['Tables']['user_sessions']['Update'];

// Notification Preferences types
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
export type NotificationPreferencesInsert = Database['public']['Tables']['notification_preferences']['Insert'];
export type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

// API Key types
export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert'];
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update'];

// OAuth Connection types
export type OAuthConnection = Database['public']['Tables']['oauth_connections']['Row'];
export type OAuthConnectionInsert = Database['public']['Tables']['oauth_connections']['Insert'];
export type OAuthConnectionUpdate = Database['public']['Tables']['oauth_connections']['Update'];

// Extended types for UI
export interface UserProfileWithEmail extends UserProfile {
  email?: string;
}

export interface ApiKeyWithPlainText extends Omit<ApiKey, 'key_hash'> {
  key_plain?: string; // Only shown once when created
}

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  platform?: string;
}
