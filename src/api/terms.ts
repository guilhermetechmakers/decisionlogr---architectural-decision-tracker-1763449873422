import { supabase } from '@/lib/supabase';
import type {
  TermsOfService,
  UserAcceptance,
  TermsOfServiceResponse,
  UserAcceptanceResponse,
  AcceptanceCheckResponse,
} from '@/types/terms';

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
 * Get the current active Terms of Service
 */
export async function getCurrentTermsOfService(): Promise<TermsOfServiceResponse> {
  try {
    const { data, error } = await supabase
      .from('terms_of_service')
      .select('*')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No active ToS found
        return {
          success: false,
          message: 'No active Terms of Service found.',
        };
      }
      throw error;
    }

    return {
      success: true,
      data: data as TermsOfService,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch Terms of Service');
  }
}

/**
 * Get a specific Terms of Service version
 */
export async function getTermsOfServiceByVersion(
  version: string
): Promise<TermsOfServiceResponse> {
  try {
    const { data, error } = await supabase
      .from('terms_of_service')
      .select('*')
      .eq('version_number', version)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: `Terms of Service version ${version} not found.`,
        };
      }
      throw error;
    }

    return {
      success: true,
      data: data as TermsOfService,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch Terms of Service');
  }
}

/**
 * Record user acceptance of Terms of Service
 */
export async function recordUserAcceptance(
  version: string,
  method: 'signup' | 'post-update' | 'manual' = 'manual',
  metadata?: Record<string, any>
): Promise<UserAcceptanceResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to accept Terms of Service');
    }

    // Check if user already accepted this version
    const { data: existing } = await supabase
      .from('user_acceptance')
      .select('*')
      .eq('user_id', user.id)
      .eq('tos_version_accepted', version)
      .single();

    if (existing) {
      return {
        success: true,
        data: existing as UserAcceptance,
        message: 'You have already accepted this version of the Terms of Service.',
      };
    }

    // Record new acceptance
    const { data, error } = await supabase
      .from('user_acceptance')
      .insert({
        user_id: user.id,
        tos_version_accepted: version,
        method_of_acceptance: method,
        ip_address: getClientIP(),
        user_agent: getUserAgent(),
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data as UserAcceptance,
      message: 'Terms of Service accepted successfully.',
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to record Terms of Service acceptance');
  }
}

/**
 * Check if user needs to accept the current Terms of Service
 */
export async function checkUserAcceptanceStatus(): Promise<AcceptanceCheckResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated - no acceptance needed
      return {
        needsAcceptance: false,
        message: 'User not authenticated.',
      };
    }

    // Get current active ToS
    const tosResponse = await getCurrentTermsOfService();
    if (!tosResponse.success || !tosResponse.data) {
      return {
        needsAcceptance: false,
        message: 'No active Terms of Service found.',
      };
    }

    const currentVersion = tosResponse.data.version_number;

    // Check if user has accepted the current version
    const { data: acceptance } = await supabase
      .from('user_acceptance')
      .select('*')
      .eq('user_id', user.id)
      .eq('tos_version_accepted', currentVersion)
      .single();

    if (acceptance) {
      return {
        needsAcceptance: false,
        currentVersion,
        userAcceptedVersion: acceptance.tos_version_accepted,
        message: 'User has accepted the current Terms of Service.',
      };
    }

    // Check what version user last accepted (if any)
    const { data: lastAcceptance } = await supabase
      .from('user_acceptance')
      .select('*')
      .eq('user_id', user.id)
      .order('acceptance_date', { ascending: false })
      .limit(1)
      .single();

    return {
      needsAcceptance: true,
      currentVersion,
      userAcceptedVersion: lastAcceptance?.tos_version_accepted || null,
      message: 'User needs to accept the current Terms of Service.',
    };
  } catch (error: any) {
    // If error is "not found" for acceptance, user needs to accept
    if (error.code === 'PGRST116') {
      const tosResponse = await getCurrentTermsOfService();
      return {
        needsAcceptance: true,
        currentVersion: tosResponse.data?.version_number,
        message: 'User needs to accept the current Terms of Service.',
      };
    }
    throw new Error(error.message || 'Failed to check Terms of Service acceptance status');
  }
}

/**
 * Get user's acceptance history
 */
export async function getUserAcceptanceHistory(): Promise<UserAcceptance[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('user_acceptance')
      .select('*')
      .eq('user_id', user.id)
      .order('acceptance_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as UserAcceptance[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch acceptance history');
  }
}
