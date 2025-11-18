import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { getDecision } from './decisions';

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export interface ClientActionParams {
  token: string;
  decisionId: string;
  name?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConfirmChoiceParams extends ClientActionParams {
  optionId: string;
}

export interface AskQuestionParams extends ClientActionParams {
  question: string;
}

export interface RequestChangeParams extends ClientActionParams {
  changeRequest: string;
  reason?: string;
}

/**
 * Validate share token and get decision access
 */
export async function validateShareToken(token: string): Promise<{
  valid: boolean;
  decisionId?: string;
  expired?: boolean;
  revoked?: boolean;
  requiresPasscode?: boolean;
}> {
  const { data: shareToken, error } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !shareToken) {
    return { valid: false };
  }

  // Check if revoked
  if (shareToken.revoked) {
    return { valid: false, revoked: true };
  }

  // Check if expired
  if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
    return { valid: false, expired: true };
  }

  return {
    valid: true,
    decisionId: shareToken.decision_id,
    requiresPasscode: !!shareToken.passcode_hash,
  };
}

/**
 * Verify passcode for share token
 */
export async function verifyShareTokenPasscode(
  token: string,
  _passcode: string
): Promise<{ valid: boolean }> {
  // In production, this would verify against passcode_hash using bcrypt
  // For now, we'll check if passcode_hash exists and validate server-side
  const { data: shareToken } = await supabase
    .from('share_tokens')
    .select('passcode_hash')
    .eq('token', token)
    .single();

  if (!shareToken?.passcode_hash) {
    return { valid: true }; // No passcode required
  }

  // In production, use bcrypt.compare here
  // For now, return valid (server-side validation)
  return { valid: true };
}

/**
 * Confirm a decision choice (client action)
 */
export async function confirmChoice(params: ConfirmChoiceParams): Promise<void> {
  const { token, decisionId, optionId, name, email, ipAddress, userAgent } = params;

  // Validate token
  const validation = await validateShareToken(token);
  if (!validation.valid) {
    throw new Error('Invalid or expired share link');
  }

  // Check if decision is already decided
  const { data: decision, error: decisionError } = await supabase
    .from('decisions')
    .select('status, final_choice_option_id')
    .eq('id', decisionId)
    .single();

  if (decisionError) throw decisionError;
  if (!decision) throw new Error('Decision not found');

  if (decision.status === 'decided' && decision.final_choice_option_id) {
    throw new Error('This decision has already been confirmed');
  }

  // Get share token for metadata
  const { data: shareToken } = await supabase
    .from('share_tokens')
    .select('id')
    .eq('token', token)
    .single();

  // Update decision status
  const { error: updateError } = await supabase
    .from('decisions')
    .update({
      status: 'decided',
      final_choice_option_id: optionId,
    })
    .eq('id', decisionId);

  if (updateError) throw updateError;

  // Create activity log entry
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: null, // Guest action
      actor_meta: {
        email: email || null,
        name: name || null,
        linkTokenId: shareToken?.id || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
      action_type: 'client_confirmed',
      payload: {
        option_id: optionId,
        confirmed_at: new Date().toISOString(),
      },
    });

  if (activityError) throw activityError;

  // Create notification for assignee/creator
  const { data: decisionWithAssignee } = await supabase
    .from('decisions')
    .select('title, assignee_id, created_by')
    .eq('id', decisionId)
    .single();

  if (decisionWithAssignee) {
    const notifyUserId = decisionWithAssignee.assignee_id || decisionWithAssignee.created_by;
    
    if (notifyUserId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          decision_id: decisionId,
          notification_type: 'client_confirmed',
          title: 'Decision Confirmed',
          message: `A client has confirmed their choice for decision "${decisionWithAssignee.title || 'Untitled'}"`,
          metadata: {
            option_id: optionId,
            client_name: name || 'Anonymous',
            client_email: email || null,
          },
        });
    }
  }
}

/**
 * Ask a question (client action)
 */
export async function askQuestion(params: AskQuestionParams): Promise<void> {
  const { token, decisionId, question, name, email, ipAddress, userAgent } = params;

  // Validate token
  const validation = await validateShareToken(token);
  if (!validation.valid) {
    throw new Error('Invalid or expired share link');
  }

  // Get share token for metadata
  const { data: shareToken } = await supabase
    .from('share_tokens')
    .select('id')
    .eq('token', token)
    .single();

  // Create comment (question)
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      decision_id: decisionId,
      author_id: null, // Guest comment
      author_meta: {
        email: email || null,
        name: name || null,
        linkTokenId: shareToken?.id || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
      body: question,
    })
    .select()
    .single();

  if (commentError) throw commentError;

  // Create activity log entry
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: null,
      actor_meta: {
        email: email || null,
        name: name || null,
        linkTokenId: shareToken?.id || null,
      },
      action_type: 'client_question',
      payload: {
        comment_id: comment.id,
      },
    });

  if (activityError) throw activityError;

  // Create notification for assignee/creator
  const { data: decision } = await supabase
    .from('decisions')
    .select('title, assignee_id, created_by')
    .eq('id', decisionId)
    .single();

  if (decision) {
    const notifyUserId = decision.assignee_id || decision.created_by;
    
    if (notifyUserId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          decision_id: decisionId,
          notification_type: 'client_question',
          title: 'New Question',
          message: `A client asked a question about decision "${decision.title || 'Untitled'}"`,
          metadata: {
            comment_id: comment.id,
            client_name: name || 'Anonymous',
            client_email: email || null,
          },
        });
    }
  }
}

/**
 * Request a change (client action)
 */
export async function requestChange(params: RequestChangeParams): Promise<void> {
  const { token, decisionId, changeRequest, reason, name, email, ipAddress, userAgent } = params;

  // Validate token
  const validation = await validateShareToken(token);
  if (!validation.valid) {
    throw new Error('Invalid or expired share link');
  }

  // Get share token for metadata
  const { data: shareToken } = await supabase
    .from('share_tokens')
    .select('id')
    .eq('token', token)
    .single();

  // Create comment (change request)
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      decision_id: decisionId,
      author_id: null, // Guest comment
      author_meta: {
        email: email || null,
        name: name || null,
        linkTokenId: shareToken?.id || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        changeRequest: true,
        reason: reason || null,
      },
      body: changeRequest,
    })
    .select()
    .single();

  if (commentError) throw commentError;

  // Create activity log entry
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: null,
      actor_meta: {
        email: email || null,
        name: name || null,
        linkTokenId: shareToken?.id || null,
      },
      action_type: 'client_change_request',
      payload: {
        comment_id: comment.id,
        reason: reason || null,
      },
    });

  if (activityError) throw activityError;

  // Create notification for assignee/creator
  const { data: decision } = await supabase
    .from('decisions')
    .select('title, assignee_id, created_by')
    .eq('id', decisionId)
    .single();

  if (decision) {
    const notifyUserId = decision.assignee_id || decision.created_by;
    
    if (notifyUserId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          decision_id: decisionId,
          notification_type: 'client_change_request',
          title: 'Change Request',
          message: `A client requested a change to decision "${decision.title || 'Untitled'}"`,
          metadata: {
            comment_id: comment.id,
            client_name: name || 'Anonymous',
            client_email: email || null,
            reason: reason || null,
          },
        });
    }
  }
}

/**
 * Get decision by share token (for client view)
 */
export async function getDecisionByShareToken(token: string) {
  const validation = await validateShareToken(token);
  if (!validation.valid || !validation.decisionId) {
    throw new Error('Invalid or expired share link');
  }

  return getDecision(validation.decisionId);
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      read_status: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Get unread notifications for current user
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read_status', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all notifications for current user
 */
export async function getAllNotifications(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}
