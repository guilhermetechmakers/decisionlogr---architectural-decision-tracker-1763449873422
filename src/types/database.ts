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
          company: string | null;
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
          company?: string | null;
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
          role?: 'architect' | 'project_manager' | 'designer' | 'developer' | 'other' | null;
          email_verified?: boolean;
          onboarding_completed?: boolean;
          metadata?: Record<string, any>;
        };
        Update: {
          full_name?: string;
          company?: string | null;
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
          role?: 'architect' | 'project_manager' | 'designer' | 'developer' | 'other' | null;
          email_verified?: boolean;
          onboarding_completed?: boolean;
          metadata?: Record<string, any>;
        };
      };
    };
  };
}
