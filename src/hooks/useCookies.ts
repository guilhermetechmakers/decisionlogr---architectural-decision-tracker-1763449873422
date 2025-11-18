import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCookies,
  getCookiesByCategory,
  getCookiePreferences,
  savePreferences,
  acceptAllCookies,
  rejectAllCookies,
  logConsentAction,
  getConsentBannerState,
  dismissConsentBanner as dismissBanner,
} from '@/api/cookies';
import type { CookieCategory, ConsentActionType } from '@/types/cookies';

// Query keys
export const cookieKeys = {
  all: ['cookies'] as const,
  lists: () => [...cookieKeys.all, 'list'] as const,
  list: (category?: CookieCategory) => [...cookieKeys.lists(), category] as const,
  preferences: () => [...cookieKeys.all, 'preferences'] as const,
  bannerState: () => [...cookieKeys.all, 'banner-state'] as const,
};

// Get all cookies
export function useCookies() {
  return useQuery({
    queryKey: cookieKeys.lists(),
    queryFn: getCookies,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Get cookies by category
export function useCookiesByCategory(category: CookieCategory) {
  return useQuery({
    queryKey: cookieKeys.list(category),
    queryFn: () => getCookiesByCategory(category),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Get user cookie preferences
export function useCookiePreferences() {
  return useQuery({
    queryKey: cookieKeys.preferences(),
    queryFn: getCookiePreferences,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get consent banner state
export function useConsentBannerState() {
  return useQuery({
    queryKey: cookieKeys.bannerState(),
    queryFn: getConsentBannerState,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Save preferences mutation
export function useSavePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookieKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: cookieKeys.bannerState() });
      toast.success('Cookie preferences saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save preferences: ${error.message}`);
    },
  });
}

// Accept all cookies mutation
export function useAcceptAllCookies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptAllCookies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookieKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: cookieKeys.bannerState() });
      toast.success('All cookies accepted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept cookies: ${error.message}`);
    },
  });
}

// Reject all cookies mutation
export function useRejectAllCookies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectAllCookies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookieKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: cookieKeys.bannerState() });
      toast.success('Non-essential cookies rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject cookies: ${error.message}`);
    },
  });
}

// Log consent action mutation
export function useLogConsentAction() {
  return useMutation({
    mutationFn: ({ actionType, category }: { actionType: ConsentActionType; category?: CookieCategory }) =>
      logConsentAction(actionType, category),
    onError: (error: Error) => {
      // Silent failure - logging errors shouldn't break the flow
      console.error('Failed to log consent action:', error);
    },
  });
}

// Dismiss consent banner
export function useDismissConsentBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      dismissBanner();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cookieKeys.bannerState() });
    },
  });
}
