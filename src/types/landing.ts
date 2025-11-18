/**
 * Landing page types
 */

export interface LandingFeature {
  id: string;
  title: string;
  description: string;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingTestimonial {
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
}

export interface LandingPricingTier {
  id: string;
  tier_name: string;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string;
  features_included: string[];
  display_order: number;
  is_popular: boolean;
  is_active: boolean;
  description: string | null;
  cta_text: string;
  created_at: string;
  updated_at: string;
}

export interface DemoRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  preferred_date?: string;
  message?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
  category?: 'support' | 'sales' | 'partnership' | 'other';
}
