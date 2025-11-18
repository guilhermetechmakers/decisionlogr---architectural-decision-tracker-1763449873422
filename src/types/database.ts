/**
 * Supabase database types
 * This is a placeholder - in production, generate types from Supabase CLI
 */

export interface Database {
  public: {
    Tables: {
      cookies: {
        Row: {
          id: string;
          name: string;
          purpose: string;
          duration: string;
          category: 'essential' | 'analytics' | 'advertising' | 'functional' | 'performance';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          purpose: string;
          duration: string;
          category: 'essential' | 'analytics' | 'advertising' | 'functional' | 'performance';
          description?: string | null;
        };
        Update: {
          name?: string;
          purpose?: string;
          duration?: string;
          category?: 'essential' | 'analytics' | 'advertising' | 'functional' | 'performance';
          description?: string | null;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string | null;
          cookie_category: 'essential' | 'analytics' | 'advertising' | 'functional' | 'performance';
          preference_status: 'accepted' | 'rejected' | 'pending';
          guest_session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          cookie_category: 'essential' | 'analytics' | 'advertising' | 'functional' | 'performance';
          preference_status?: 'accepted' | 'rejected' | 'pending';
          guest_session_id?: string | null;
        };
        Update: {
          preference_status?: 'accepted' | 'rejected' | 'pending';
        };
      };
      consent_logs: {
        Row: {
          id: string;
          user_id: string | null;
          guest_session_id: string | null;
          action_type: 'accept_all' | 'reject_all' | 'accept_category' | 'reject_category' | 'manage_preferences' | 'view_policy';
          cookie_category: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_session_id?: string | null;
          action_type: 'accept_all' | 'reject_all' | 'accept_category' | 'reject_category' | 'manage_preferences' | 'view_policy';
          cookie_category?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          title: string | null;
          company: string | null;
          phone: string | null;
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
          role: 'architect' | 'project_manager' | 'designer' | 'developer' | 'other' | null;
          email_verified: boolean;
          onboarding_completed: boolean;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          title?: string | null;
          company?: string | null;
          phone?: string | null;
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
          role?: 'architect' | 'project_manager' | 'designer' | 'developer' | 'other' | null;
          email_verified?: boolean;
          onboarding_completed?: boolean;
          metadata?: Record<string, any>;
        };
        Update: {
          full_name?: string;
          title?: string | null;
          company?: string | null;
          phone?: string | null;
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
          role?: 'architect' | 'project_manager' | 'designer' | 'developer' | 'other' | null;
          email_verified?: boolean;
          onboarding_completed?: boolean;
          metadata?: Record<string, any>;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          device_info: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          is_active: boolean;
          last_activity_at: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          device_info?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: {
          is_active?: boolean;
          last_activity_at?: string;
          expires_at?: string | null;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          decision_created: boolean;
          decision_updated: boolean;
          client_comment: boolean;
          client_confirmation: boolean;
          decision_reminder: boolean;
          weekly_summary: boolean;
          monthly_report: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          decision_created?: boolean;
          decision_updated?: boolean;
          client_comment?: boolean;
          client_confirmation?: boolean;
          decision_reminder?: boolean;
          weekly_summary?: boolean;
          monthly_report?: boolean;
        };
        Update: {
          decision_created?: boolean;
          decision_updated?: boolean;
          client_comment?: boolean;
          client_confirmation?: boolean;
          decision_reminder?: boolean;
          weekly_summary?: boolean;
          monthly_report?: boolean;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          key_name: string;
          key_hash: string;
          key_prefix: string;
          permissions: Record<string, any>;
          metadata: Record<string, any>;
          is_active: boolean;
          last_used_at: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          key_name: string;
          key_hash: string;
          key_prefix: string;
          permissions?: Record<string, any>;
          metadata?: Record<string, any>;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: {
          key_name?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          expires_at?: string | null;
        };
      };
      oauth_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: 'google' | 'microsoft' | 'github' | 'slack' | 'other';
          provider_user_id: string;
          provider_email: string | null;
          provider_name: string | null;
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          scopes: string[];
          metadata: Record<string, any>;
          is_active: boolean;
          last_synced_at: string | null;
          connected_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'google' | 'microsoft' | 'github' | 'slack' | 'other';
          provider_user_id: string;
          provider_email?: string | null;
          provider_name?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          scopes?: string[];
          metadata?: Record<string, any>;
          is_active?: boolean;
        };
        Update: {
          is_active?: boolean;
          last_synced_at?: string | null;
        };
      };
      verification_attempts: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          attempt_type: 'verify' | 'resend';
          status: 'pending' | 'success' | 'failed' | 'expired';
          token_hash: string | null;
          expires_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          attempt_type: 'verify' | 'resend';
          status?: 'pending' | 'success' | 'failed' | 'expired';
          token_hash?: string | null;
          expires_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          status?: 'pending' | 'success' | 'failed' | 'expired';
          token_hash?: string | null;
          expires_at?: string | null;
          metadata?: Record<string, any>;
        };
      };
    };
  };
}
