import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Decision = Database['public']['Tables']['decisions']['Row'];
export type DecisionInsert = Database['public']['Tables']['decisions']['Insert'];
export type DecisionUpdate = Database['public']['Tables']['decisions']['Update'];
export type Option = Database['public']['Tables']['options']['Row'];
export type OptionInsert = Database['public']['Tables']['options']['Insert'];
export type OptionUpdate = Database['public']['Tables']['options']['Update'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type ShareToken = Database['public']['Tables']['share_tokens']['Row'];

export interface DecisionWithRelations extends Decision {
  project: {
    id: string;
    name: string;
    org_id: string;
  };
  options: Option[];
  activities: Activity[];
  comments: Comment[];
  share_token: ShareToken | null;
  assignee: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface DecisionListParams {
  projectId?: string;
  status?: Decision['status'];
  assigneeId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get a single decision with all related data
 */
export async function getDecision(decisionId: string): Promise<DecisionWithRelations> {
  const { data: decision, error: decisionError } = await supabase
    .from('decisions')
    .select('*')
    .eq('id', decisionId)
    .single();

  if (decisionError) throw decisionError;
  if (!decision) throw new Error('Decision not found');

  // Fetch related data
  const [projectResult, optionsResult, activitiesResult, commentsResult, shareTokenResult, assigneeResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, org_id')
      .eq('id', decision.project_id)
      .single(),
    supabase
      .from('options')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: true }),
    supabase
      .from('activities')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: false }),
    supabase
      .from('comments')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: true }),
    supabase
      .from('share_tokens')
      .select('*')
      .eq('decision_id', decisionId)
      .eq('revoked', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    decision.assignee_id
      ? (async () => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id, full_name')
            .eq('user_id', decision.assignee_id)
            .single();
          
          if (profile) {
            const { data: user } = await supabase.auth.getUser(decision.assignee_id);
            return {
              id: profile.user_id,
              full_name: profile.full_name,
              email: user?.user?.email || '',
            };
          }
          return null;
        })()
      : Promise.resolve(null),
  ]);

  return {
    ...decision,
    project: projectResult.data!,
    options: optionsResult.data || [],
    activities: activitiesResult.data || [],
    comments: commentsResult.data || [],
    share_token: shareTokenResult.data,
    assignee: await assigneeResult,
  };
}

/**
 * List decisions with filters
 */
export async function listDecisions(params: DecisionListParams = {}): Promise<Decision[]> {
  let query = supabase
    .from('decisions')
    .select('*')
    .eq('archived', false);

  if (params.projectId) {
    query = query.eq('project_id', params.projectId);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.assigneeId) {
    query = query.eq('assignee_id', params.assigneeId);
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  query = query.order('required_by', { ascending: true });

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Create a new decision
 */
export async function createDecision(decision: DecisionInsert, options: OptionInsert[]): Promise<DecisionWithRelations> {
  const { data: newDecision, error: decisionError } = await supabase
    .from('decisions')
    .insert(decision)
    .select()
    .single();

  if (decisionError) throw decisionError;
  if (!newDecision) throw new Error('Failed to create decision');

  // Create options
  if (options.length > 0) {
    const optionsWithDecisionId = options.map(opt => ({
      ...opt,
      decision_id: newDecision.id,
    }));

    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsWithDecisionId);

    if (optionsError) throw optionsError;
  }

  // Create activity log entry
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: newDecision.id,
      actor_id: newDecision.created_by,
      action_type: 'created',
      payload: { title: newDecision.title },
    });

  if (activityError) throw activityError;

  return getDecision(newDecision.id);
}

/**
 * Update a decision
 */
export async function updateDecision(decisionId: string, updates: DecisionUpdate): Promise<DecisionWithRelations> {
  const { data, error } = await supabase
    .from('decisions')
    .update(updates)
    .eq('id', decisionId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Decision not found');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: data.created_by,
      action_type: 'updated',
      payload: updates,
    });

  if (activityError) throw activityError;

  return getDecision(decisionId);
}

/**
 * Archive a decision
 */
export async function archiveDecision(decisionId: string): Promise<void> {
  const { error } = await supabase
    .from('decisions')
    .update({ archived: true, status: 'archived' })
    .eq('id', decisionId);

  if (error) throw error;

  // Log activity
  const { data: decision } = await supabase
    .from('decisions')
    .select('created_by')
    .eq('id', decisionId)
    .single();

  if (decision) {
    await supabase
      .from('activities')
      .insert({
        decision_id: decisionId,
        actor_id: decision.created_by,
        action_type: 'archived',
        payload: {},
      });
  }
}

/**
 * Mark decision as decided with final choice
 */
export async function markDecisionDecided(decisionId: string, optionId: string): Promise<DecisionWithRelations> {
  const { data, error } = await supabase
    .from('decisions')
    .update({
      status: 'decided',
      final_choice_option_id: optionId,
    })
    .eq('id', decisionId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Decision not found');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: data.created_by,
      action_type: 'client_confirmed',
      payload: { option_id: optionId },
    });

  if (activityError) throw activityError;

  return getDecision(decisionId);
}

/**
 * Update an option
 */
export async function updateOption(optionId: string, updates: OptionUpdate): Promise<Option> {
  const { data, error } = await supabase
    .from('options')
    .update(updates)
    .eq('id', optionId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Option not found');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: data.decision_id,
      actor_id: null, // Will be set by server
      action_type: 'updated',
      payload: { option_id: optionId, updates },
    });

  if (activityError) throw activityError;

  return data;
}

/**
 * Create a comment
 */
export async function createComment(comment: CommentInsert): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create comment');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: comment.decision_id,
      actor_id: comment.author_id || null,
      actor_meta: comment.author_meta || {},
      action_type: comment.author_id ? 'commented' : 'client_question',
      payload: { comment_id: data.id },
    });

  if (activityError) throw activityError;

  return data;
}

/**
 * Generate or get share token
 */
export async function getOrCreateShareToken(decisionId: string): Promise<ShareToken> {
  // Check for existing active token
  const { data: existing } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('decision_id', decisionId)
    .eq('revoked', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
    return existing;
  }

  // Create new token
  const token = crypto.randomUUID();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('share_tokens')
    .insert({
      decision_id: decisionId,
      token,
      created_by: user?.user?.id || '',
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
      actor_id: user?.user?.id || null,
      action_type: 'shared',
      payload: { token_id: data.id },
    });

  if (activityError) throw activityError;

  return data;
}

/**
 * Export decision as PDF (placeholder - would call backend service)
 */
export async function exportDecisionToPDF(decisionId: string): Promise<{ url: string }> {
  // This would typically call a backend service
  // For now, return a placeholder
  return { url: `/api/decisions/${decisionId}/export/pdf` };
}

/**
 * Send reminder for decision
 */
export async function sendReminder(decisionId: string): Promise<void> {
  const { data: decision } = await supabase
    .from('decisions')
    .select('created_by')
    .eq('id', decisionId)
    .single();

  if (!decision) throw new Error('Decision not found');

  // Log activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      decision_id: decisionId,
      actor_id: decision.created_by,
      action_type: 'reminder_sent',
      payload: {},
    });

  if (activityError) throw activityError;

  // In production, this would trigger an email
}
