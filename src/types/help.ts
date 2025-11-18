/**
 * Database types for Help/About page tables
 * Generated: 2025-11-18T09:50:31Z
 */

// =====================================================
// FAQ Types
// =====================================================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQInsert {
  id?: string;
  question: string;
  answer: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export type FAQRow = FAQ;

// =====================================================
// Contact Form Types
// =====================================================

export type ContactFormStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type ContactFormPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ContactForm {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  subject: string;
  description: string;
  attachment_url: string | null;
  attachment_name: string | null;
  status: ContactFormStatus;
  priority: ContactFormPriority;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ContactFormInsert {
  id?: string;
  user_id?: string | null;
  guest_session_id?: string | null;
  subject: string;
  description: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  status?: ContactFormStatus;
  priority?: ContactFormPriority;
  metadata?: Record<string, any>;
}

export interface ContactFormUpdate {
  subject?: string;
  description?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  status?: ContactFormStatus;
  priority?: ContactFormPriority;
  metadata?: Record<string, any>;
  resolved_at?: string | null;
}

export type ContactFormRow = ContactForm;

// =====================================================
// Changelog Entry Types
// =====================================================

export type ChangelogReleaseType = 'major' | 'minor' | 'patch' | 'hotfix';

export interface ChangelogEntry {
  id: string;
  version_number: string;
  release_date: string;
  title: string;
  description: string;
  release_type: ChangelogReleaseType;
  highlights: string[];
  breaking_changes: string | null;
  migration_notes: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangelogEntryInsert {
  id?: string;
  version_number: string;
  release_date: string;
  title: string;
  description: string;
  release_type?: ChangelogReleaseType;
  highlights?: string[];
  breaking_changes?: string | null;
  migration_notes?: string | null;
  is_published?: boolean;
}

export interface ChangelogEntryUpdate {
  version_number?: string;
  release_date?: string;
  title?: string;
  description?: string;
  release_type?: ChangelogReleaseType;
  highlights?: string[];
  breaking_changes?: string | null;
  migration_notes?: string | null;
  is_published?: boolean;
}

export type ChangelogEntryRow = ChangelogEntry;

// =====================================================
// API Response Types
// =====================================================

export interface FAQResponse {
  success: boolean;
  data?: FAQ;
  message?: string;
}

export interface FAQListResponse {
  success: boolean;
  data?: FAQ[];
  message?: string;
}

export interface ContactFormResponse {
  success: boolean;
  data?: ContactForm;
  message?: string;
}

export interface ChangelogEntryResponse {
  success: boolean;
  data?: ChangelogEntry;
  message?: string;
}

export interface ChangelogEntryListResponse {
  success: boolean;
  data?: ChangelogEntry[];
  message?: string;
}
