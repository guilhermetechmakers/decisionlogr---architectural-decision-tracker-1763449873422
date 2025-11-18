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
      landing_features: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon_name: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon_name?: string | null;
          display_order?: number;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          icon_name?: string | null;
          display_order?: number;
          is_active?: boolean;
        };
      };
      landing_testimonials: {
        Row: {
          id: string;
          user_name: string;
          firm_name: string | null;
          feedback: string;
          user_pic_url: string | null;
          display_order: number;
          is_featured: boolean;
          is_active: boolean;
          role: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_name: string;
          firm_name?: string | null;
          feedback: string;
          user_pic_url?: string | null;
          display_order?: number;
          is_featured?: boolean;
          is_active?: boolean;
          role?: string | null;
          rating?: number | null;
        };
        Update: {
          user_name?: string;
          firm_name?: string | null;
          feedback?: string;
          user_pic_url?: string | null;
          display_order?: number;
          is_featured?: boolean;
          is_active?: boolean;
          role?: string | null;
          rating?: number | null;
        };
      };
      landing_pricing_tiers: {
        Row: {
          id: string;
          tier_name: string;
          price_monthly: number | null;
          price_yearly: number | null;
          currency: string;
          features_included: Record<string, any>;
          display_order: number;
          is_popular: boolean;
          is_active: boolean;
          description: string | null;
          cta_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tier_name: string;
          price_monthly?: number | null;
          price_yearly?: number | null;
          currency?: string;
          features_included?: Record<string, any>;
          display_order?: number;
          is_popular?: boolean;
          is_active?: boolean;
          description?: string | null;
          cta_text?: string;
        };
        Update: {
          tier_name?: string;
          price_monthly?: number | null;
          price_yearly?: number | null;
          currency?: string;
          features_included?: Record<string, any>;
          display_order?: number;
          is_popular?: boolean;
          is_active?: boolean;
          description?: string | null;
          cta_text?: string;
        };
      };
      demo_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          phone: string | null;
          preferred_date: string | null;
          message: string | null;
          status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          phone?: string | null;
          preferred_date?: string | null;
          message?: string | null;
          status?: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          name?: string;
          email?: string;
          company?: string | null;
          phone?: string | null;
          preferred_date?: string | null;
          message?: string | null;
          status?: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
          metadata?: Record<string, any>;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          phone: string | null;
          subject: string | null;
          message: string;
          category: 'support' | 'sales' | 'partnership' | 'other' | null;
          status: 'new' | 'in_progress' | 'resolved' | 'archived';
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          phone?: string | null;
          subject?: string | null;
          message: string;
          category?: 'support' | 'sales' | 'partnership' | 'other' | null;
          status?: 'new' | 'in_progress' | 'resolved' | 'archived';
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          name?: string;
          email?: string;
          company?: string | null;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          category?: 'support' | 'sales' | 'partnership' | 'other' | null;
          status?: 'new' | 'in_progress' | 'resolved' | 'archived';
          metadata?: Record<string, any>;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          billing_plan: 'free' | 'pro' | 'enterprise';
          retention_policy: Record<string, any>;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          billing_plan?: 'free' | 'pro' | 'enterprise';
          retention_policy?: Record<string, any>;
          metadata?: Record<string, any>;
        };
        Update: {
          name?: string;
          billing_plan?: 'free' | 'pro' | 'enterprise';
          retention_policy?: Record<string, any>;
          metadata?: Record<string, any>;
        };
      };
      projects: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          timezone: string;
          default_required_by_offset: number;
          metadata: Record<string, any>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          timezone?: string;
          default_required_by_offset?: number;
          metadata?: Record<string, any>;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          timezone?: string;
          default_required_by_offset?: number;
          metadata?: Record<string, any>;
        };
      };
      decisions: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          area: string | null;
          description: string | null;
          required_by: string; // DATE
          status: 'pending' | 'waiting_for_client' | 'decided' | 'overdue' | 'archived';
          assignee_id: string | null;
          visibility_settings: Record<string, any>;
          archived: boolean;
          final_choice_option_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          area?: string | null;
          description?: string | null;
          required_by: string; // DATE
          status?: 'pending' | 'waiting_for_client' | 'decided' | 'overdue' | 'archived';
          assignee_id?: string | null;
          visibility_settings?: Record<string, any>;
          archived?: boolean;
          final_choice_option_id?: string | null;
          created_by: string;
        };
        Update: {
          title?: string;
          area?: string | null;
          description?: string | null;
          required_by?: string;
          status?: 'pending' | 'waiting_for_client' | 'decided' | 'overdue' | 'archived';
          assignee_id?: string | null;
          visibility_settings?: Record<string, any>;
          archived?: boolean;
          final_choice_option_id?: string | null;
        };
      };
      options: {
        Row: {
          id: string;
          decision_id: string;
          title: string;
          specs: Record<string, any>;
          cost_delta_numeric: number | null;
          image_refs: string[];
          pros_cons_text: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          title: string;
          specs?: Record<string, any>;
          cost_delta_numeric?: number | null;
          image_refs?: string[];
          pros_cons_text?: string | null;
          is_default?: boolean;
        };
        Update: {
          title?: string;
          specs?: Record<string, any>;
          cost_delta_numeric?: number | null;
          image_refs?: string[];
          pros_cons_text?: string | null;
          is_default?: boolean;
        };
      };
      activities: {
        Row: {
          id: string;
          decision_id: string;
          actor_id: string | null;
          actor_meta: Record<string, any>;
          action_type: 'created' | 'updated' | 'archived' | 'shared' | 'commented' | 'client_question' | 'client_change_request' | 'client_confirmed' | 'exported' | 'reminder_sent' | 'link_regenerated';
          payload: Record<string, any>;
          hash_signature: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          actor_id?: string | null;
          actor_meta?: Record<string, any>;
          action_type: 'created' | 'updated' | 'archived' | 'shared' | 'commented' | 'client_question' | 'client_change_request' | 'client_confirmed' | 'exported' | 'reminder_sent' | 'link_regenerated';
          payload?: Record<string, any>;
          hash_signature?: string | null;
        };
        Update: {
          actor_meta?: Record<string, any>;
          payload?: Record<string, any>;
          hash_signature?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          decision_id: string;
          author_id: string | null;
          author_meta: Record<string, any>;
          body: string;
          attachments: string[];
          parent_comment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          author_id?: string | null;
          author_meta?: Record<string, any>;
          body: string;
          attachments?: string[];
          parent_comment_id?: string | null;
        };
        Update: {
          body?: string;
          attachments?: string[];
        };
      };
      share_tokens: {
        Row: {
          id: string;
          decision_id: string;
          token: string;
          expires_at: string | null;
          passcode_hash: string | null;
          allowed_actions: string[];
          revoked: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          decision_id: string;
          token: string;
          expires_at?: string | null;
          passcode_hash?: string | null;
          allowed_actions?: string[];
          revoked?: boolean;
          created_by: string;
        };
        Update: {
          expires_at?: string | null;
          passcode_hash?: string | null;
          allowed_actions?: string[];
          revoked?: boolean;
        };
      };
      attachments: {
        Row: {
          id: string;
          decision_id: string | null;
          comment_id: string | null;
          url: string;
          mime: string;
          width: number | null;
          height: number | null;
          size: number;
          storage_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          decision_id?: string | null;
          comment_id?: string | null;
          url: string;
          mime: string;
          width?: number | null;
          height?: number | null;
          size: number;
          storage_key: string;
        };
        Update: {
          url?: string;
          mime?: string;
          width?: number | null;
          height?: number | null;
          size?: number;
          storage_key?: string;
        };
      };
      terms_of_service: {
        Row: {
          id: string;
          version_number: string;
          content: string;
          effective_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          version_number: string;
          content: string;
          effective_date: string;
          is_active?: boolean;
        };
        Update: {
          version_number?: string;
          content?: string;
          effective_date?: string;
          is_active?: boolean;
        };
      };
      user_acceptance: {
        Row: {
          id: string;
          user_id: string;
          tos_version_accepted: string;
          acceptance_date: string;
          method_of_acceptance: 'signup' | 'post-update' | 'manual';
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tos_version_accepted: string;
          acceptance_date?: string;
          method_of_acceptance: 'signup' | 'post-update' | 'manual';
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          tos_version_accepted?: string;
          acceptance_date?: string;
          method_of_acceptance?: 'signup' | 'post-update' | 'manual';
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action_type: 'password_reset' | 'link_regenerated' | 'login_attempt' | 'login_success' | 'login_failed' | 'user_suspended' | 'user_activated' | 'role_changed' | 'permission_granted' | 'permission_revoked' | 'share_link_revoked' | 'content_removed' | 'billing_updated' | 'subscription_changed' | 'admin_action';
          resource_type: string | null;
          resource_id: string | null;
          details: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action_type: 'password_reset' | 'link_regenerated' | 'login_attempt' | 'login_success' | 'login_failed' | 'user_suspended' | 'user_activated' | 'role_changed' | 'permission_granted' | 'permission_revoked' | 'share_link_revoked' | 'content_removed' | 'billing_updated' | 'subscription_changed' | 'admin_action';
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          action_type?: 'password_reset' | 'link_regenerated' | 'login_attempt' | 'login_success' | 'login_failed' | 'user_suspended' | 'user_activated' | 'role_changed' | 'permission_granted' | 'permission_revoked' | 'share_link_revoked' | 'content_removed' | 'billing_updated' | 'subscription_changed' | 'admin_action';
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any>;
        };
      };
      billing_subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan_type: 'free' | 'pro' | 'enterprise';
          billing_cycle: 'monthly' | 'yearly';
          status: 'active' | 'cancelled' | 'past_due' | 'expired' | 'trialing';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          seats_count: number;
          amount_cents: number;
          currency: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan_type: 'free' | 'pro' | 'enterprise';
          billing_cycle: 'monthly' | 'yearly';
          status?: 'active' | 'cancelled' | 'past_due' | 'expired' | 'trialing';
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          seats_count?: number;
          amount_cents: number;
          currency?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          plan_type?: 'free' | 'pro' | 'enterprise';
          billing_cycle?: 'monthly' | 'yearly';
          status?: 'active' | 'cancelled' | 'past_due' | 'expired' | 'trialing';
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          seats_count?: number;
          amount_cents?: number;
          currency?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          metadata?: Record<string, any>;
        };
      };
      billing_invoices: {
        Row: {
          id: string;
          subscription_id: string;
          organization_id: string;
          invoice_number: string;
          amount_cents: number;
          currency: string;
          status: 'pending' | 'paid' | 'failed' | 'refunded' | 'void';
          due_date: string | null;
          paid_at: string | null;
          stripe_invoice_id: string | null;
          pdf_url: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          organization_id: string;
          invoice_number: string;
          amount_cents: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'void';
          due_date?: string | null;
          paid_at?: string | null;
          stripe_invoice_id?: string | null;
          pdf_url?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'void';
          due_date?: string | null;
          paid_at?: string | null;
          pdf_url?: string | null;
          metadata?: Record<string, any>;
        };
      };
      moderation_flags: {
        Row: {
          id: string;
          content_type: 'share_link' | 'attachment' | 'comment' | 'decision' | 'user';
          content_id: string;
          flagged_by_user_id: string | null;
          flag_reason: string;
          flag_category: 'spam' | 'inappropriate' | 'copyright' | 'abuse' | 'policy_violation' | 'other' | null;
          status: 'pending' | 'reviewed' | 'approved' | 'removed' | 'dismissed';
          reviewed_by_user_id: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_type: 'share_link' | 'attachment' | 'comment' | 'decision' | 'user';
          content_id: string;
          flagged_by_user_id?: string | null;
          flag_reason: string;
          flag_category?: 'spam' | 'inappropriate' | 'copyright' | 'abuse' | 'policy_violation' | 'other' | null;
          status?: 'pending' | 'reviewed' | 'approved' | 'removed' | 'dismissed';
          reviewed_by_user_id?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          status?: 'pending' | 'reviewed' | 'approved' | 'removed' | 'dismissed';
          reviewed_by_user_id?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          metadata?: Record<string, any>;
        };
      };
    };
  };
}
