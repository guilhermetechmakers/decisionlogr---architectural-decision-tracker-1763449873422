import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getFAQs,
  getFAQById,
  getFAQCategories,
  submitContactForm,
  getUserContactForms,
  getChangelogEntries,
  getChangelogEntryByVersion,
  getLatestChangelogEntry,
} from '@/api/help';
import type { ContactFormInsert } from '@/types/help';

/**
 * Query key factory for Help queries
 */
export const helpKeys = {
  all: ['help'] as const,
  faqs: (category?: string) => [...helpKeys.all, 'faqs', category] as const,
  faq: (id: string) => [...helpKeys.all, 'faq', id] as const,
  faqCategories: () => [...helpKeys.all, 'faq-categories'] as const,
  contactForms: () => [...helpKeys.all, 'contact-forms'] as const,
  changelog: (limit?: number) => [...helpKeys.all, 'changelog', limit] as const,
  changelogVersion: (version: string) => [...helpKeys.all, 'changelog', 'version', version] as const,
  latestChangelog: () => [...helpKeys.all, 'changelog', 'latest'] as const,
};

/**
 * Hook to fetch FAQs, optionally filtered by category
 */
export function useFAQs(category?: string) {
  return useQuery({
    queryKey: helpKeys.faqs(category),
    queryFn: async () => {
      const response = await getFAQs(category);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch FAQs');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch a single FAQ by ID
 */
export function useFAQ(id: string) {
  return useQuery({
    queryKey: helpKeys.faq(id),
    queryFn: async () => {
      return await getFAQById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch FAQ categories
 */
export function useFAQCategories() {
  return useQuery({
    queryKey: helpKeys.faqCategories(),
    queryFn: async () => {
      return await getFAQCategories();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to submit a contact form
 */
export function useSubmitContactForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Omit<ContactFormInsert, 'user_id' | 'guest_session_id' | 'metadata'>) => {
      const response = await submitContactForm(formData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to submit contact form');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate contact forms query
      queryClient.invalidateQueries({ queryKey: helpKeys.contactForms() });
      
      toast.success('Message sent successfully', {
        description: 'We have received your message and will get back to you soon.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to send message', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

/**
 * Hook to fetch user's contact form submissions
 */
export function useUserContactForms() {
  return useQuery({
    queryKey: helpKeys.contactForms(),
    queryFn: async () => {
      return await getUserContactForms();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch changelog entries
 */
export function useChangelogEntries(limit?: number) {
  return useQuery({
    queryKey: helpKeys.changelog(limit),
    queryFn: async () => {
      const response = await getChangelogEntries(limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch changelog entries');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook to fetch a changelog entry by version
 */
export function useChangelogEntryByVersion(version: string) {
  return useQuery({
    queryKey: helpKeys.changelogVersion(version),
    queryFn: async () => {
      return await getChangelogEntryByVersion(version);
    },
    enabled: !!version,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch the latest changelog entry
 */
export function useLatestChangelogEntry() {
  return useQuery({
    queryKey: helpKeys.latestChangelog(),
    queryFn: async () => {
      return await getLatestChangelogEntry();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
