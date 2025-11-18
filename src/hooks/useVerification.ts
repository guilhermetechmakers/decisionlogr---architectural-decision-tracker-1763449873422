import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { verifyEmailToken, resendVerificationEmail } from '@/api/verification';
import type { ResendVerificationResult } from '@/types/verification';

// Query keys
export const verificationKeys = {
  all: ['verification'] as const,
  status: (token?: string) => [...verificationKeys.all, 'status', token] as const,
  cooldown: (email: string) => [...verificationKeys.all, 'cooldown', email] as const,
};

/**
 * Verify email token
 */
export function useVerifyEmail(token?: string) {
  return useQuery({
    queryKey: verificationKeys.status(token),
    queryFn: () => verifyEmailToken(token),
    enabled: !!token || typeof window !== 'undefined', // Run on mount if no token
    retry: false,
    staleTime: 0, // Always fetch fresh
  });
}

/**
 * Resend verification email mutation
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
    onSuccess: (result: ResendVerificationResult) => {
      if (result.success) {
        toast.success('Verification email sent!', {
          description: 'Please check your inbox for the verification link.',
        });
      } else {
        toast.error('Cannot resend email', {
          description: result.message,
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to resend verification email', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}
