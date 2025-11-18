/**
 * Email verification types
 */

export interface VerificationAttempt {
  id: string;
  user_id: string;
  email: string;
  attempt_type: 'verify' | 'resend';
  status: 'pending' | 'success' | 'failed' | 'expired';
  token_hash: string | null;
  expires_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
  };
}

export interface ResendVerificationResult {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
}

export interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'expired';
  message: string;
  canResend: boolean;
  cooldownSeconds?: number;
}
