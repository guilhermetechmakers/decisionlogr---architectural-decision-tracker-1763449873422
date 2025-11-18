import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ShareToken = Database['public']['Tables']['share_tokens']['Row'];
export type ShareTokenInsert = Database['public']['Tables']['share_tokens']['Insert'];
export type ShareTokenUpdate = Database['public']['Tables']['share_tokens']['Update'];
export type AccessLog = Database['public']['Tables']['access_logs']['Row'];
export type AccessLogInsert = Database['public']['Tables']['access_logs']['Insert'];

export interface GenerateShareLinkParams {
  decisionId: string;
  passcode?: string;
  expiresAt?: string;
  allowedActions?: string[];
}

export interface ShareTokenWithLogs extends ShareToken {
  access_logs?: AccessLog[];
  access_count?: number;
}

/**
 * Generate a cryptographically secure random token
 */
function generateSecureToken(): string {
  // Use crypto.randomUUID() for secure token generation
  // In production, you might want to use a longer token
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * Hash passcode (placeholder - in production use bcrypt)
 * Note: This should be done server-side with proper bcrypt hashing
 */
async function hashPasscode(passcode: string): Promise<string> {
  // In production, this should call a backend API that uses bcrypt
  // For now, we'll store a placeholder (server should hash it)
  // This is a security risk - passcode hashing MUST be done server-side
  return `hashed_${passcode}`; // Placeholder - DO NOT use in production
}

/**
 * Generate a new share link with optional passcode and expiration
 */
export async function generateShareLink(params: GenerateShareLinkParams): Promise<ShareToken> {
  const { decisionId, passcode, expiresAt, allowedActions } = params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to generate share links');
  }

  // Generate secure token
  const token = generateSecureToken();

  // Hash passcode if provided (NOTE: This should be done server-side!)
  let passcodeHash: string | null = null;
  if (passcode) {
    // WARNING: In production, passcode hashing MUST be done server-side
    // This is a placeholder - the actual hashing should happen in a backend API
    passcodeHash = await hashPasscode(passcode);
  }

  // Create share token
  const { data, error } = await supabase
    .from('share_tokens')
    .insert({
      decision_id: decisionId,
      token,
      expires_at: expiresAt || null,
      passcode_hash: passcodeHash,
      allowed_actions: allowedActions || ['view', 'comment', 'confirm'],
      revoked: false,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create share token');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: user.id,
      action_type: 'shared',
      payload: {
        token_id: data.id,
        has_passcode: !!passcode,
        expires_at: expiresAt || null,
      },
    });

  if (activityError) {
    console.error('Failed to log activity:', activityError);
  }

  return data;
}

/**
 * Get all share tokens for a decision
 */
export async function getShareTokensForDecision(decisionId: string): Promise<ShareToken[]> {
  const { data, error } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('decision_id', decisionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get share token with access logs
 */
export async function getShareTokenWithLogs(tokenId: string): Promise<ShareTokenWithLogs> {
  const { data: token, error: tokenError } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (tokenError) throw tokenError;
  if (!token) throw new Error('Share token not found');

  // Get access logs
  const { data: logs, error: logsError } = await supabase
    .from('access_logs')
    .select('*')
    .eq('share_token_id', tokenId)
    .order('access_time', { ascending: false })
    .limit(100);

  if (logsError) {
    console.error('Failed to fetch access logs:', logsError);
  }

  return {
    ...token,
    access_logs: logs || [],
    access_count: logs?.length || 0,
  };
}

/**
 * Revoke a share token
 */
export async function revokeShareToken(tokenId: string): Promise<void> {
  const { data: token } = await supabase
    .from('share_tokens')
    .select('decision_id, created_by')
    .eq('id', tokenId)
    .single();

  if (!token) throw new Error('Share token not found');

  const { error } = await supabase
    .from('share_tokens')
    .update({ revoked: true })
    .eq('id', tokenId);

  if (error) throw error;

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: token.decision_id,
      actor_id: token.created_by,
      action_type: 'link_regenerated',
      payload: { token_id: tokenId, action: 'revoked' },
    });

  if (activityError) {
    console.error('Failed to log activity:', activityError);
  }
}

/**
 * Regenerate a share token (revoke old, create new)
 */
export async function regenerateShareToken(
  oldTokenId: string,
  params?: Omit<GenerateShareLinkParams, 'decisionId'>
): Promise<ShareToken> {
  // Get old token to get decision ID
  const { data: oldToken } = await supabase
    .from('share_tokens')
    .select('decision_id, expires_at, passcode_hash, allowed_actions')
    .eq('id', oldTokenId)
    .single();

  if (!oldToken) throw new Error('Share token not found');

  // Revoke old token
  await revokeShareToken(oldTokenId);

  // Generate new token with same settings (or new ones if provided)
  return generateShareLink({
    decisionId: oldToken.decision_id,
    expiresAt: params?.expiresAt || oldToken.expires_at || undefined,
    allowedActions: params?.allowedActions || oldToken.allowed_actions || undefined,
    // Note: We can't regenerate the passcode hash, so new token won't have passcode
    // unless explicitly provided
    passcode: params?.passcode,
  });
}

/**
 * Extend expiration date for a share token
 */
export async function extendShareTokenExpiration(
  tokenId: string,
  newExpiresAt: string
): Promise<ShareToken> {
  const { data, error } = await supabase
    .from('share_tokens')
    .update({ expires_at: newExpiresAt })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Share token not found');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: data.decision_id,
      actor_id: data.created_by,
      action_type: 'link_regenerated',
      payload: {
        token_id: tokenId,
        action: 'extended',
        new_expires_at: newExpiresAt,
      },
    });

  if (activityError) {
    console.error('Failed to log activity:', activityError);
  }

  return data;
}

/**
 * Log access attempt
 */
export async function logAccessAttempt(params: {
  shareTokenId: string;
  decisionId: string;
  action: AccessLogInsert['action_taken'];
  clientName?: string;
  clientEmail?: string;
  metadata?: Record<string, any>;
}): Promise<AccessLog> {
  const { shareTokenId, decisionId, action, clientName, clientEmail, metadata } = params;

  // Get IP and user agent from browser
  const ipAddress = null; // In production, get from request headers
  const userAgent = navigator.userAgent;

  const { data, error } = await supabase
    .from('access_logs')
    .insert({
      share_token_id: shareTokenId,
      decision_id: decisionId,
      action_taken: action,
      ip_address: ipAddress,
      user_agent: userAgent,
      client_name: clientName || null,
      client_email: clientEmail || null,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create access log');

  return data;
}

/**
 * Get access logs for a share token
 */
export async function getAccessLogs(
  shareTokenId: string,
  limit = 50,
  offset = 0
): Promise<AccessLog[]> {
  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .eq('share_token_id', shareTokenId)
    .order('access_time', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Get access statistics for a share token
 */
export async function getAccessStatistics(shareTokenId: string): Promise<{
  totalViews: number;
  totalComments: number;
  totalConfirmations: number;
  uniqueIPs: number;
  lastAccess: string | null;
}> {
  const { data: logs, error } = await supabase
    .from('access_logs')
    .select('action_taken, ip_address, access_time')
    .eq('share_token_id', shareTokenId);

  if (error) throw error;

  const totalViews = logs?.filter(l => l.action_taken === 'view').length || 0;
  const totalComments = logs?.filter(l => l.action_taken === 'comment' || l.action_taken === 'ask_question').length || 0;
  const totalConfirmations = logs?.filter(l => l.action_taken === 'confirm').length || 0;
  const uniqueIPs = new Set(logs?.map(l => l.ip_address).filter(Boolean)).size;
  const lastAccess = logs && logs.length > 0
    ? logs.sort((a, b) => new Date(b.access_time).getTime() - new Date(a.access_time).getTime())[0].access_time
    : null;

  return {
    totalViews,
    totalComments,
    totalConfirmations,
    uniqueIPs,
    lastAccess,
  };
}
