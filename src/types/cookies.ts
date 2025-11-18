/**
 * Database types for cookies, user_preferences, and consent_logs tables
 * Generated: 2025-11-18T08:23:16Z
 */

export type CookieCategory = 'essential' | 'analytics' | 'advertising' | 'functional' | 'performance';
export type PreferenceStatus = 'accepted' | 'rejected' | 'pending';
export type ConsentActionType = 'accept_all' | 'reject_all' | 'accept_category' | 'reject_category' | 'manage_preferences' | 'view_policy';

export interface Cookie {
  id: string;
  name: string;
  purpose: string;
  duration: string;
  category: CookieCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CookieInsert {
  id?: string;
  name: string;
  purpose: string;
  duration: string;
  category: CookieCategory;
  description?: string | null;
}

export interface CookieUpdate {
  name?: string;
  purpose?: string;
  duration?: string;
  category?: CookieCategory;
  description?: string | null;
}

export interface UserPreference {
  id: string;
  user_id: string | null;
  cookie_category: CookieCategory;
  preference_status: PreferenceStatus;
  guest_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferenceInsert {
  id?: string;
  user_id?: string | null;
  cookie_category: CookieCategory;
  preference_status: PreferenceStatus;
  guest_session_id?: string | null;
}

export interface UserPreferenceUpdate {
  preference_status?: PreferenceStatus;
}

export interface ConsentLog {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  action_type: ConsentActionType;
  cookie_category: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ConsentLogInsert {
  id?: string;
  user_id?: string | null;
  guest_session_id?: string | null;
  action_type: ConsentActionType;
  cookie_category?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// Cookie preferences grouped by category
export interface CookiePreferences {
  essential: PreferenceStatus;
  analytics: PreferenceStatus;
  advertising: PreferenceStatus;
  functional: PreferenceStatus;
  performance: PreferenceStatus;
}

// Consent banner state
export interface ConsentBannerState {
  isVisible: boolean;
  hasConsented: boolean;
  preferences: CookiePreferences | null;
}
