import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

/**
 * Error information for logging
 */
export interface ErrorLogInfo {
  path: string;
  timestamp: string;
  userAgent: string;
  referrer: string | null;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a server error to the backend
 * This function attempts to log errors but fails silently to avoid breaking the error page
 */
export async function logError(errorInfo: ErrorLogInfo): Promise<void> {
  try {
    // Try to log via API endpoint first (if available)
    try {
      await api.post('/errors/log', {
        ...errorInfo,
        errorType: 'server_error',
        severity: 'high',
      });
      return;
    } catch (apiError) {
      // If API endpoint doesn't exist, try Supabase
      console.warn('API error logging failed, trying Supabase:', apiError);
    }

    // Fallback: Try to log to Supabase if available
    // Note: error_logs table may not exist yet - this will fail gracefully
    try {
      const { error } = await (supabase as any)
        .from('error_logs')
        .insert({
          error_type: 'server_error',
          severity: 'high',
          path: errorInfo.path,
          user_agent: errorInfo.userAgent,
          referrer: errorInfo.referrer,
          error_message: errorInfo.errorMessage || null,
          error_stack: errorInfo.errorStack || null,
          metadata: errorInfo.metadata || {},
          created_at: errorInfo.timestamp,
        });

      if (error) {
        // Silently fail - we don't want error logging to break the error page
        console.warn('Error logging failed:', error);
      }
    } catch (supabaseError) {
      // Table might not exist - that's okay
      console.warn('Supabase error logging not available:', supabaseError);
    }
  } catch (error) {
    // Silently fail - error logging should never break the error page
    console.warn('Error logging failed:', error);
  }
}

/**
 * Log a client-side error
 */
export async function logClientError(
  error: Error,
  errorInfo?: {
    componentStack?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const errorLogInfo: ErrorLogInfo = {
      path: errorInfo?.path || window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      errorMessage: error.message,
      errorStack: error.stack || undefined,
      metadata: {
        ...errorInfo?.metadata,
        componentStack: errorInfo?.componentStack,
      },
    };

    await logError(errorLogInfo);
  } catch {
    // Silently fail
  }
}
