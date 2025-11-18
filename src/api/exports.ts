import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Export = Database['public']['Tables']['exports']['Row'];
export type ExportInsert = Database['public']['Tables']['exports']['Insert'];
export type ExportUpdate = Database['public']['Tables']['exports']['Update'];

export interface ExportParams {
  decisionId?: string;
  projectId?: string;
  exportType: 'pdf' | 'csv';
  includeImages?: boolean;
  includeAuditTrail?: boolean;
}

export interface ExportWithDetails extends Export {
  decision?: {
    id: string;
    title: string;
    project_id: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Create a new export job
 */
export async function createExport(params: ExportParams): Promise<Export> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');

  if (!params.decisionId && !params.projectId) {
    throw new Error('Either decisionId or projectId must be provided');
  }

  if (params.decisionId && params.projectId) {
    throw new Error('Cannot export both decision and project at the same time');
  }

  const exportData: ExportInsert = {
    user_id: user.user.id,
    decision_id: params.decisionId || null,
    project_id: params.projectId || null,
    export_type: params.exportType,
    include_images: params.includeImages ?? true,
    include_audit_trail: params.includeAuditTrail ?? true,
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('exports')
    .insert(exportData)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create export');

  // Log activity if exporting a decision
  if (params.decisionId) {
    await supabase
      .from('activities')
      .insert({
        decision_id: params.decisionId,
        actor_id: user.user.id,
        action_type: 'exported',
        payload: { export_id: data.id, export_type: params.exportType },
      });
  }

  // In production, this would trigger a background job
  // For now, we'll simulate immediate processing
  // The actual PDF/CSV generation would happen server-side

  return data;
}

/**
 * Get a single export with details
 */
export async function getExport(exportId: string): Promise<ExportWithDetails> {
  const { data: export_, error: exportError } = await supabase
    .from('exports')
    .select('*')
    .eq('id', exportId)
    .single();

  if (exportError) throw exportError;
  if (!export_) throw new Error('Export not found');

  // Fetch related decision or project
  let decision = null;
  let project = null;

  if (export_.decision_id) {
    const { data: decisionData } = await supabase
      .from('decisions')
      .select('id, title, project_id')
      .eq('id', export_.decision_id)
      .single();
    decision = decisionData;
  }

  if (export_.project_id) {
    const { data: projectData } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', export_.project_id)
      .single();
    project = projectData;
  }

  return {
    ...export_,
    decision,
    project,
  };
}

/**
 * List exports for the current user
 */
export async function listExports(params: {
  limit?: number;
  offset?: number;
  status?: Export['status'];
} = {}): Promise<Export[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');

  let query = supabase
    .from('exports')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (params.status) {
    query = query.eq('status', params.status);
  }

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
 * Update export status (typically called by background job)
 */
export async function updateExportStatus(
  exportId: string,
  updates: ExportUpdate
): Promise<Export> {
  const { data, error } = await supabase
    .from('exports')
    .update(updates)
    .eq('id', exportId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Export not found');

  // If export completed, create notification
  if (updates.status === 'completed' && updates.file_url) {
    const { data: export_ } = await supabase
      .from('exports')
      .select('user_id, decision_id')
      .eq('id', exportId)
      .single();

    if (export_) {
      await supabase
        .from('notifications')
        .insert({
          user_id: export_.user_id,
          decision_id: export_.decision_id,
          notification_type: 'export_ready',
          title: 'Export Ready',
          message: `Your ${data.export_type.toUpperCase()} export is ready for download.`,
          metadata: { export_id: exportId, file_url: updates.file_url },
        });
    }
  }

  return data;
}

/**
 * Download export file (returns signed URL)
 */
export async function getExportDownloadUrl(exportId: string): Promise<string> {
  const { data: export_, error } = await supabase
    .from('exports')
    .select('file_url, status')
    .eq('id', exportId)
    .single();

  if (error) throw error;
  if (!export_) throw new Error('Export not found');

  if (export_.status !== 'completed') {
    throw new Error('Export is not ready yet');
  }

  if (!export_.file_url) {
    throw new Error('Export file URL not available');
  }

  // In production, this would generate a signed URL from storage
  // For now, return the stored URL
  return export_.file_url;
}

/**
 * Delete an export record
 */
export async function deleteExport(exportId: string): Promise<void> {
  const { error } = await supabase
    .from('exports')
    .delete()
    .eq('id', exportId);

  if (error) throw error;
}
