import { supabase } from '@/lib/supabase';
import type { LandingFeature, LandingTestimonial, LandingPricingTier, DemoRequest, ContactSubmission } from '@/types/landing';

/**
 * Fetch all active features for landing page
 */
export async function getLandingFeatures(): Promise<LandingFeature[]> {
  const { data, error } = await supabase
    .from('landing_features')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch features: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all active testimonials for landing page
 */
export async function getLandingTestimonials(): Promise<LandingTestimonial[]> {
  const { data, error } = await supabase
    .from('landing_testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch testimonials: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch featured testimonials (subset for hero/testimonial section)
 */
export async function getFeaturedTestimonials(limit = 3): Promise<LandingTestimonial[]> {
  const { data, error } = await supabase
    .from('landing_testimonials')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch featured testimonials: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all active pricing tiers for landing page
 */
export async function getLandingPricingTiers(): Promise<LandingPricingTier[]> {
  const { data, error } = await supabase
    .from('landing_pricing_tiers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch pricing tiers: ${error.message}`);
  }

  // Transform features_included from JSONB to string array
  return (data || []).map(tier => ({
    ...tier,
    features_included: Array.isArray(tier.features_included) 
      ? tier.features_included 
      : [],
  }));
}

/**
 * Submit a demo request
 */
export async function submitDemoRequest(request: DemoRequest): Promise<{ id: string }> {
  // Get client metadata
  const ip_address = await getClientIP();
  const user_agent = navigator.userAgent;

  const { data, error } = await supabase
    .from('demo_requests')
    .insert({
      ...request,
      ip_address,
      user_agent,
      metadata: {},
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to submit demo request: ${error.message}`);
  }

  return { id: data.id };
}

/**
 * Submit a contact form
 */
export async function submitContactForm(submission: ContactSubmission): Promise<{ id: string }> {
  // Get client metadata
  const ip_address = await getClientIP();
  const user_agent = navigator.userAgent;

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({
      ...submission,
      ip_address,
      user_agent,
      metadata: {},
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to submit contact form: ${error.message}`);
  }

  return { id: data.id };
}

/**
 * Helper to get client IP (simplified - in production, use a service)
 */
async function getClientIP(): Promise<string | null> {
  try {
    // In production, you might call an IP detection service
    // For now, return null as it's optional
    return null;
  } catch {
    return null;
  }
}
