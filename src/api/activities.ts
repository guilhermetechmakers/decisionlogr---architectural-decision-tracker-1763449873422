import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type RetentionSettings = Database['public']['Tables']['retention_settings']['Row'];
export type RetentionSettingsInsert = Database['public']['Tables']['retention_settings']['Insert'];
export type RetentionSettingsUpdate = Database['public']['Tables']['retention_settings']['Update'];

export interface ActivityWithActor extends Activity {
  actor?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  decision?: {
    id: string;
    title: string;
    project_id: string;
  } | null;
}

export interface ActivityListParams {
  decisionId?: string;
  projectId?: string;
  actionType?: Activity['action_type'];
  actorId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'csv';
  activityIds?: string[];
  decisionId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  includeHistory?: boolean;
  includeImages?: boolean;
}

/**
 * List activities with filters
 */
export async function listActivities(params: ActivityListParams = {}): Promise<ActivityWithActor[]> {
  let query = supabase
    .from('activities')
    .select(`
      *,
      decision:decisions!inner(id, title, project_id)
    `)
    .order('created_at', { ascending: false });

  if (params.decisionId) {
    query = query.eq('decision_id', params.decisionId);
  }

  if (params.projectId) {
    // Filter by project requires joining with decisions table
    // For now, we'll filter client-side after fetching
    // In production, this should be done via a proper join query
  }

  if (params.actionType) {
    query = query.eq('action_type', params.actionType);
  }

  if (params.actorId) {
    query = query.eq('actor_id', params.actorId);
  }

  if (params.startDate) {
    query = query.gte('created_at', params.startDate);
  }

  if (params.endDate) {
    query = query.lte('created_at', params.endDate);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
  }

  const { data: activities, error } = await query;

  if (error) throw error;

  // Resolve actor information for each activity
  let activitiesWithActors = await Promise.all(
    (activities || []).map(async (activity) => {
      let actor = null;

      if (activity.actor_id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, full_name')
          .eq('user_id', activity.actor_id)
          .single();

        if (profile) {
          const { data: user } = await supabase.auth.getUser(activity.actor_id);
          actor = {
            id: profile.user_id,
            full_name: profile.full_name,
            email: user?.user?.email || '',
          };
        }
      }

      return {
        ...activity,
        actor,
        decision: activity.decision as { id: string; title: string; project_id: string } | null,
      };
    })
  );

  // Filter by project if specified (client-side filter)
  if (params.projectId) {
    activitiesWithActors = activitiesWithActors.filter(
      (activity) => activity.decision?.project_id === params.projectId
    );
  }

  return activitiesWithActors;
}

/**
 * Get a single activity by ID
 */
export async function getActivity(activityId: string): Promise<ActivityWithActor> {
  const { data: activity, error } = await supabase
    .from('activities')
    .select(`
      *,
      decision:decisions!inner(id, title, project_id)
    `)
    .eq('id', activityId)
    .single();

  if (error) throw error;
  if (!activity) throw new Error('Activity not found');

  let actor = null;
  if (activity.actor_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .eq('user_id', activity.actor_id)
      .single();

    if (profile) {
      const { data: user } = await supabase.auth.getUser(activity.actor_id);
      actor = {
        id: profile.user_id,
        full_name: profile.full_name,
        email: user?.user?.email || '',
      };
    }
  }

  return {
    ...activity,
    actor,
    decision: activity.decision as { id: string; title: string; project_id: string } | null,
  };
}

/**
 * Create an activity log entry
 * Note: This should typically be called server-side or via triggers
 */
export async function createActivity(activity: ActivityInsert): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create activity');

  return data;
}

/**
 * Get retention settings for an organization
 */
export async function getRetentionSettings(organizationId: string): Promise<RetentionSettings | null> {
  const { data, error } = await supabase
    .from('retention_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - return null
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Create or update retention settings
 */
export async function upsertRetentionSettings(
  organizationId: string,
  settings: RetentionSettingsInsert | RetentionSettingsUpdate
): Promise<RetentionSettings> {
  const { data: existing } = await supabase
    .from('retention_settings')
    .select('id')
    .eq('organization_id', organizationId)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('retention_settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update retention settings');

    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('retention_settings')
      .insert({
        ...settings,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create retention settings');

    return data;
  }
}

/**
 * Export activities to PDF or CSV
 * Note: This is a placeholder - in production, this would call a backend service
 */
export async function exportActivities(options: ExportOptions): Promise<{ url: string; jobId?: string }> {
  // In production, this would:
  // 1. Create a background job
  // 2. Generate the export file (PDF/CSV)
  // 3. Store it temporarily
  // 4. Return a download URL

  const params = new URLSearchParams();
  params.set('format', options.format);
  if (options.activityIds) {
    params.set('activityIds', options.activityIds.join(','));
  }
  if (options.decisionId) {
    params.set('decisionId', options.decisionId);
  }
  if (options.projectId) {
    params.set('projectId', options.projectId);
  }
  if (options.startDate) {
    params.set('startDate', options.startDate);
  }
  if (options.endDate) {
    params.set('endDate', options.endDate);
  }
  if (options.includeHistory !== undefined) {
    params.set('includeHistory', String(options.includeHistory));
  }
  if (options.includeImages !== undefined) {
    params.set('includeImages', String(options.includeImages));
  }

  return {
    url: `/api/activities/export?${params.toString()}`,
    jobId: crypto.randomUUID(),
  };
}

/**
 * Get activity statistics
 */
export async function getActivityStats(params: {
  projectId?: string;
  decisionId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  total: number;
  byActionType: Record<string, number>;
  byActor: Record<string, number>;
}> {
  // Use listActivities to get filtered activities, then compute stats
  const activities = await listActivities({
    decisionId: params.decisionId,
    projectId: params.projectId,
    startDate: params.startDate,
    endDate: params.endDate,
    limit: 10000, // Get all for stats
  });

  const stats = {
    total: activities.length,
    byActionType: {} as Record<string, number>,
    byActor: {} as Record<string, number>,
  };

  activities.forEach((activity) => {
    // Count by action type
    const actionType = activity.action_type;
    stats.byActionType[actionType] = (stats.byActionType[actionType] || 0) + 1;

    // Count by actor
    const actorId = activity.actor_id || 'guest';
    stats.byActor[actorId] = (stats.byActor[actorId] || 0) + 1;
  });

  return stats;
}
