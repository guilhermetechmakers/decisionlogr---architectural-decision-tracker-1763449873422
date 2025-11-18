import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectInsertInput = Omit<ProjectInsert, 'org_id' | 'created_by'>;
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/**
 * List all projects for the current user's organization
 */
export async function listProjects(orgId?: string): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get a single project
 */
export async function getProject(projectId: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Project not found');
  return data;
}

/**
 * Create a new project
 */
export async function createProject(project: ProjectInsertInput): Promise<Project> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    throw new Error('User not authenticated');
  }

  // Get user's organization (simplified - in production, get from user profile)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.user.id)
    .single();

  // For now, create a default org if none exists
  let orgId: string;
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (!orgs) {
    // Create default org
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: profile?.company || 'My Organization',
        billing_plan: 'free',
      })
      .select()
      .single();

    if (orgError) throw orgError;
    orgId = newOrg.id;
  } else {
    orgId = orgs.id;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      org_id: orgId,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create project');
  return data;
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Project not found');
  return data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}
