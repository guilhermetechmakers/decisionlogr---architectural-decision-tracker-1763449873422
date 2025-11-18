/**
 * Types for Terms of Service functionality
 */

export interface TermsOfService {
  id: string;
  version_number: string;
  content: string;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAcceptance {
  id: string;
  user_id: string;
  tos_version_accepted: string;
  acceptance_date: string;
  method_of_acceptance: 'signup' | 'post-update' | 'manual';
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TermsOfServiceResponse {
  success: boolean;
  data?: TermsOfService;
  message?: string;
}

export interface UserAcceptanceResponse {
  success: boolean;
  data?: UserAcceptance;
  message?: string;
}

export interface AcceptanceCheckResponse {
  needsAcceptance: boolean;
  currentVersion?: string;
  userAcceptedVersion?: string;
  message?: string;
}
