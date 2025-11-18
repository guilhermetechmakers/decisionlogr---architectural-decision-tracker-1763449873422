import { supabase } from '@/lib/supabase';
import type { VerificationResult, ResendVerificationResult } from '@/types/verification';

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


/**
 * Verify email token from URL
 * Supabase handles email verification automatically via URL hash fragments
 * This function logs the attempt and checks verification status
 */
export async function verifyEmailToken(_token?: string): Promise<VerificationResult> {
  try {
    // Supabase processes email verification tokens via URL hash fragments
    // When a user clicks the verification link, Supabase automatically processes it
    // We need to check the session and user status
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError && userError.message !== 'User not found') {
      throw new Error(userError.message);
    }

    // If no user, they might not be logged in yet
    // Check if there's a hash in the URL that Supabase needs to process
    if (typeof window !== 'undefined' && window.location.hash) {
      // Supabase processes hash fragments automatically
      // Wait a moment for it to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check again after processing
      const { data: { user: updatedUser }, error: updatedError } = await supabase.auth.getUser();
      
      if (updatedError && updatedError.message !== 'User not found') {
        throw new Error(updatedError.message);
      }
      
      if (updatedUser?.email_confirmed_at) {
        await logVerificationAttempt({
          email: updatedUser.email!,
          attempt_type: 'verify',
          status: 'success',
        });

        return {
          success: true,
          message: 'Your email has been verified successfully!',
          user: {
            id: updatedUser.id,
            email: updatedUser.email!,
            email_confirmed_at: updatedUser.email_confirmed_at,
          },
        };
      }
    }

    if (!user) {
      // User not found - might be expired token
      return {
        success: false,
        message: 'Verification link has expired or is invalid. Please request a new verification email.',
      };
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      // Log successful verification attempt
      await logVerificationAttempt({
        email: user.email!,
        attempt_type: 'verify',
        status: 'success',
      });

      return {
        success: true,
        message: 'Your email has been verified successfully!',
        user: {
          id: user.id,
          email: user.email!,
          email_confirmed_at: user.email_confirmed_at,
        },
      };
    }

    // If email is not confirmed, the token might be expired or invalid
    await logVerificationAttempt({
      email: user.email!,
      attempt_type: 'verify',
      status: 'failed',
      metadata: { reason: 'token_expired_or_invalid' },
    });

    return {
      success: false,
      message: 'Verification link has expired or is invalid. Please request a new verification email.',
    };
  } catch (error: any) {
    // Log failed attempt
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logVerificationAttempt({
          email: user.email!,
          attempt_type: 'verify',
          status: 'failed',
          metadata: { error: error.message },
        });
      }
    } catch (logError) {
      // Ignore logging errors
    }

    throw new Error(error.message || 'Failed to verify email');
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
  try {
    // Check cooldown period (60 seconds)
    const cooldownSeconds = await checkResendCooldown(email);
    if (cooldownSeconds > 0) {
      return {
        success: false,
        message: `Please wait ${cooldownSeconds} seconds before requesting another verification email.`,
        cooldownSeconds,
      };
    }

    // Resend verification email via Supabase
    // Note: Supabase doesn't have a direct resend method, so we use signInWithOtp
    // which will send a confirmation email if the user exists and is unverified
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        shouldCreateUser: false, // Don't create user if they don't exist
      },
    });

    if (error) {
      // If user doesn't exist or other error, we can't resend
      // The error message will be handled by the caller
      throw error;
    }

    // Log resend attempt
    await logVerificationAttempt({
      email,
      attempt_type: 'resend',
      status: 'success',
    });

    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    };
  } catch (error: any) {
    // Log failed attempt
    await logVerificationAttempt({
      email,
      attempt_type: 'resend',
      status: 'failed',
      metadata: { error: error.message },
    });

    throw new Error(error.message || 'Failed to resend verification email');
  }
}

/**
 * Check if user can resend verification (cooldown check)
 */
async function checkResendCooldown(email: string): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Check for recent resend attempts (within last 60 seconds)
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('verification_attempts')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('email', email)
      .eq('attempt_type', 'resend')
      .gte('created_at', sixtySecondsAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's fine
      console.error('Error checking cooldown:', error);
      return 0;
    }

    if (data) {
      const attemptTime = new Date(data.created_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - attemptTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      return remaining;
    }

    return 0;
  } catch (error) {
    console.error('Error checking cooldown:', error);
    return 0;
  }
}

/**
 * Log verification attempt
 */
async function logVerificationAttempt(params: {
  email: string;
  attempt_type: 'verify' | 'resend';
  status: 'pending' | 'success' | 'failed' | 'expired';
  token_hash?: string | null;
  expires_at?: string | null;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('verification_attempts').insert({
      user_id: user.id,
      email: params.email,
      attempt_type: params.attempt_type,
      status: params.status,
      token_hash: params.token_hash || null,
      expires_at: params.expires_at || null,
      ip_address: getClientIP(),
      user_agent: getUserAgent(),
      metadata: params.metadata || {},
    });
  } catch (error) {
    // Silently fail logging - don't break the user experience
    console.error('Failed to log verification attempt:', error);
  }
}
