import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getLandingFeatures,
  getLandingTestimonials,
  getFeaturedTestimonials,
  getLandingPricingTiers,
  submitDemoRequest,
  submitContactForm,
} from '@/api/landing';

/**
 * Query key factory for landing page queries
 */
export const landingKeys = {
  all: ['landing'] as const,
  features: () => [...landingKeys.all, 'features'] as const,
  testimonials: () => [...landingKeys.all, 'testimonials'] as const,
  featuredTestimonials: (limit?: number) => [...landingKeys.all, 'testimonials', 'featured', limit] as const,
  pricingTiers: () => [...landingKeys.all, 'pricing-tiers'] as const,
};

/**
 * Hook to fetch landing page features
 */
export function useLandingFeatures() {
  return useQuery({
    queryKey: landingKeys.features(),
    queryFn: getLandingFeatures,
    staleTime: 1000 * 60 * 30, // 30 minutes - features don't change often
  });
}

/**
 * Hook to fetch landing page testimonials
 */
export function useLandingTestimonials() {
  return useQuery({
    queryKey: landingKeys.testimonials(),
    queryFn: getLandingTestimonials,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch featured testimonials
 */
export function useFeaturedTestimonials(limit = 3) {
  return useQuery({
    queryKey: landingKeys.featuredTestimonials(limit),
    queryFn: () => getFeaturedTestimonials(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch landing page pricing tiers
 */
export function useLandingPricingTiers() {
  return useQuery({
    queryKey: landingKeys.pricingTiers(),
    queryFn: getLandingPricingTiers,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to submit a demo request
 */
export function useSubmitDemoRequest() {
  return useMutation({
    mutationFn: submitDemoRequest,
    onSuccess: () => {
      toast.success('Demo request submitted! We\'ll be in touch soon.');
      // Optionally invalidate queries if needed
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit demo request. Please try again.');
    },
  });
}

/**
 * Hook to submit a contact form
 */
export function useSubmitContactForm() {
  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      toast.success('Message sent! We\'ll get back to you soon.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message. Please try again.');
    },
  });
}
