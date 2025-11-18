import { supabase, getGuestSessionId } from '@/lib/supabase';
import type {
  FAQ,
  FAQListResponse,
  ContactForm,
  ContactFormInsert,
  ContactFormResponse,
  ChangelogEntry,
  ChangelogEntryListResponse,
} from '@/types/help';

/**
 * Get client IP address (simplified - in production, get from headers)
 */
function getClientIP(): string | null {
  // In production, this should come from request headers
  // For now, return null as we're on the client side
  return null;
}

/**
 * Get user agent
 */
function getUserAgent(): string | null {
  return typeof navigator !== 'undefined' ? navigator.userAgent : null;
}

// =====================================================
// FAQ Functions
// =====================================================

/**
 * Get all active FAQs, optionally filtered by category
 */
export async function getFAQs(category?: string): Promise<FAQListResponse> {
  try {
    let query = supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: (data || []) as FAQ[],
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch FAQs');
  }
}

/**
 * Get a single FAQ by ID
 */
export async function getFAQById(id: string): Promise<FAQ | null> {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as FAQ;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch FAQ');
  }
}

/**
 * Get FAQ categories
 */
export async function getFAQCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) {
      throw error;
    }

    // Get unique categories
    const categories = Array.from(
      new Set((data || []).map((item) => item.category).filter(Boolean))
    ) as string[];

    return categories.sort();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch FAQ categories');
  }
}

// =====================================================
// Contact Form Functions
// =====================================================

/**
 * Submit a contact form
 */
export async function submitContactForm(
  formData: Omit<ContactFormInsert, 'user_id' | 'guest_session_id' | 'metadata'>
): Promise<ContactFormResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare metadata
    const metadata: Record<string, any> = {
      ip_address: getClientIP(),
      user_agent: getUserAgent(),
      submitted_at: new Date().toISOString(),
    };

    // Prepare insert data
    const insertData: ContactFormInsert = {
      ...formData,
      user_id: user?.id || null,
      guest_session_id: user ? null : getGuestSessionId(),
      metadata,
      status: 'pending',
      priority: 'normal',
    };

    const { data, error } = await supabase
      .from('contact_forms')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data as ContactForm,
      message: 'Your message has been submitted successfully. We will get back to you soon.',
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit contact form');
  }
}

/**
 * Get user's contact form submissions
 */
export async function getUserContactForms(): Promise<ContactForm[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // For guest users, use guest session ID
      const guestSessionId = getGuestSessionId();
      const { data, error } = await supabase
        .from('contact_forms')
        .select('*')
        .eq('guest_session_id', guestSessionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as ContactForm[];
    }

    const { data, error } = await supabase
      .from('contact_forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ContactForm[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch contact forms');
  }
}

// =====================================================
// Changelog Functions
// =====================================================

/**
 * Get all published changelog entries, ordered by release date (newest first)
 */
export async function getChangelogEntries(
  limit?: number
): Promise<ChangelogEntryListResponse> {
  try {
    let query = supabase
      .from('changelog_entries')
      .select('*')
      .eq('is_published', true)
      .order('release_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: (data || []) as ChangelogEntry[],
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch changelog entries');
  }
}

/**
 * Get a single changelog entry by version number
 */
export async function getChangelogEntryByVersion(
  version: string
): Promise<ChangelogEntry | null> {
  try {
    const { data, error } = await supabase
      .from('changelog_entries')
      .select('*')
      .eq('version_number', version)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as ChangelogEntry;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch changelog entry');
  }
}

/**
 * Get the latest changelog entry
 */
export async function getLatestChangelogEntry(): Promise<ChangelogEntry | null> {
  try {
    const { data, error } = await supabase
      .from('changelog_entries')
      .select('*')
      .eq('is_published', true)
      .order('release_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as ChangelogEntry;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch latest changelog entry');
  }
}
