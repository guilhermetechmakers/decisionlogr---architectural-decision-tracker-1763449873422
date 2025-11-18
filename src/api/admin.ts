import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

// Type exports
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type BillingSubscription = Database['public']['Tables']['billing_subscriptions']['Row'];
export type BillingSubscriptionInsert = Database['public']['Tables']['billing_subscriptions']['Insert'];
export type BillingSubscriptionUpdate = Database['public']['Tables']['billing_subscriptions']['Update'];
export type BillingInvoice = Database['public']['Tables']['billing_invoices']['Row'];
export type BillingInvoiceInsert = Database['public']['Tables']['billing_invoices']['Insert'];
export type ModerationFlag = Database['public']['Tables']['moderation_flags']['Row'];
export type ModerationFlagInsert = Database['public']['Tables']['moderation_flags']['Insert'];
export type ModerationFlagUpdate = Database['public']['Tables']['moderation_flags']['Update'];

// User with profile information
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: string | null;
  email_verified: boolean;
  last_active: string | null;
  status: 'active' | 'suspended';
  created_at: string;
}

// Organization metrics
export interface OrgMetrics {
  organization_id: string;
  organization_name: string;
  project_count: number;
  active_decisions_count: number;
  share_links_count: number;
  storage_used_bytes: number;
  user_count: number;
}

// Admin dashboard overview
export interface AdminOverview {
  total_users: number;
  active_users: number;
  total_organizations: number;
  total_projects: number;
  total_decisions: number;
  pending_moderation_flags: number;
  overdue_decisions: number;
}

/**
 * Get all users with profile information (admin only)
 */
export async function listUsers(filters?: {
  search?: string;
  role?: string;
  status?: 'active' | 'suspended';
  limit?: number;
  offset?: number;
}): Promise<AdminUser[]> {
  let query = supabase
    .from('user_profiles')
    .select(`
      user_id,
      full_name,
      company,
      role,
      email_verified,
      created_at,
      metadata
    `)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
  }

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Get auth users to get email and last sign in
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  return (data || []).map(profile => {
    const authUser = authUsers?.users.find(u => u.id === profile.user_id);
    const status = profile.metadata?.status === 'suspended' ? 'suspended' : 'active';
    
    return {
      id: profile.user_id,
      email: authUser?.email || '',
      full_name: profile.full_name,
      company: profile.company,
      role: profile.role,
      email_verified: profile.email_verified,
      last_active: authUser?.last_sign_in_at || null,
      status,
      created_at: profile.created_at,
    };
  });
}

/**
 * Get a single user by ID (admin only)
 */
export async function getUser(userId: string): Promise<AdminUser> {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const status = profile.metadata?.status === 'suspended' ? 'suspended' : 'active';

  return {
    id: profile.user_id,
    email: authUser?.user?.email || '',
    full_name: profile.full_name,
    company: profile.company,
    role: profile.role,
    email_verified: profile.email_verified,
    last_active: authUser?.user?.last_sign_in_at || null,
    status,
    created_at: profile.created_at,
  };
}

/**
 * Suspend a user (admin only)
 */
export async function suspendUser(userId: string, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      metadata: { status: 'suspended', suspended_at: new Date().toISOString(), reason },
    })
    .eq('user_id', userId);

  if (error) throw error;

  // Log audit event
  await createAuditLog({
    user_id: userId,
    action_type: 'user_suspended',
    resource_type: 'user',
    resource_id: userId,
    details: { reason },
  });
}

/**
 * Activate a user (admin only)
 */
export async function activateUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      metadata: { status: 'active' },
    })
    .eq('user_id', userId);

  if (error) throw error;

  // Log audit event
  await createAuditLog({
    user_id: userId,
    action_type: 'user_activated',
    resource_type: 'user',
    resource_id: userId,
  });
}

/**
 * Reset user password (admin only)
 */
export async function resetUserPassword(userId: string): Promise<void> {
  // This would typically trigger a password reset email
  // For now, we'll just log the action
  await createAuditLog({
    user_id: userId,
    action_type: 'password_reset',
    resource_type: 'user',
    resource_id: userId,
  });
}

/**
 * List all organizations with metrics
 */
export async function listOrganizationsWithMetrics(): Promise<OrgMetrics[]> {
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id, name')
    .order('created_at', { ascending: false });

  if (orgsError) throw orgsError;

  // Get metrics for each organization
  const metricsPromises = (orgs || []).map(async (org) => {
    const [projects, decisions, shareLinks, users] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact' }).eq('org_id', org.id),
      supabase.from('decisions').select('id', { count: 'exact' }).eq('status', 'pending').in('project_id', 
        (await supabase.from('projects').select('id').eq('org_id', org.id)).data?.map(p => p.id) || []
      ),
      supabase.from('share_tokens').select('id', { count: 'exact' }).eq('revoked', false).in('decision_id',
        (await supabase.from('decisions').select('id').in('project_id',
          (await supabase.from('projects').select('id').eq('org_id', org.id)).data?.map(p => p.id) || []
        )).data?.map(d => d.id) || []
      ),
      supabase.from('user_profiles').select('user_id', { count: 'exact' }),
    ]);

    return {
      organization_id: org.id,
      organization_name: org.name,
      project_count: projects.count || 0,
      active_decisions_count: decisions.count || 0,
      share_links_count: shareLinks.count || 0,
      storage_used_bytes: 0, // TODO: Calculate from attachments
      user_count: users.count || 0,
    };
  });

  return Promise.all(metricsPromises);
}

/**
 * Get admin dashboard overview metrics
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    users,
    orgs,
    projects,
    decisions,
    overdueDecisions,
    moderationFlags,
  ] = await Promise.all([
    supabase.from('user_profiles').select('user_id', { count: 'exact' }),
    supabase.from('organizations').select('id', { count: 'exact' }),
    supabase.from('projects').select('id', { count: 'exact' }),
    supabase.from('decisions').select('id', { count: 'exact' }),
    supabase.from('decisions').select('id', { count: 'exact' }).eq('status', 'overdue'),
    supabase.from('moderation_flags').select('id', { count: 'exact' }).eq('status', 'pending'),
  ]);

  // Get active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const activeUsers = authUsers?.users.filter(u => 
    u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo
  ).length || 0;

  return {
    total_users: users.count || 0,
    active_users: activeUsers,
    total_organizations: orgs.count || 0,
    total_projects: projects.count || 0,
    total_decisions: decisions.count || 0,
    pending_moderation_flags: moderationFlags.count || 0,
    overdue_decisions: overdueDecisions.count || 0,
  };
}

/**
 * List audit logs with filters
 */
export async function listAuditLogs(filters?: {
  action_type?: string;
  user_id?: string;
  resource_type?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.action_type) {
    query = query.eq('action_type', filters.action_type);
  }

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters?.resource_type) {
    query = query.eq('resource_type', filters.resource_type);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(log: AuditLogInsert): Promise<AuditLog> {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * List billing subscriptions
 */
export async function listBillingSubscriptions(orgId?: string): Promise<BillingSubscription[]> {
  let query = supabase
    .from('billing_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get a single billing subscription
 */
export async function getBillingSubscription(subscriptionId: string): Promise<BillingSubscription> {
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a billing subscription
 */
export async function updateBillingSubscription(
  subscriptionId: string,
  updates: BillingSubscriptionUpdate
): Promise<BillingSubscription> {
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;

  // Log audit event
  await createAuditLog({
    action_type: 'billing_updated',
    resource_type: 'billing_subscription',
    resource_id: subscriptionId,
    details: updates,
  });

  return data;
}

/**
 * List billing invoices
 */
export async function listBillingInvoices(subscriptionId?: string, orgId?: string): Promise<BillingInvoice[]> {
  let query = supabase
    .from('billing_invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (subscriptionId) {
    query = query.eq('subscription_id', subscriptionId);
  }

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * List moderation flags
 */
export async function listModerationFlags(filters?: {
  status?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
}): Promise<ModerationFlag[]> {
  let query = supabase
    .from('moderation_flags')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.content_type) {
    query = query.eq('content_type', filters.content_type);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Update moderation flag status
 */
export async function updateModerationFlag(
  flagId: string,
  updates: ModerationFlagUpdate,
  reviewerId: string
): Promise<ModerationFlag> {
  const { data, error } = await supabase
    .from('moderation_flags')
    .update({
      ...updates,
      reviewed_by_user_id: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', flagId)
    .select()
    .single();

  if (error) throw error;

  // Log audit event if content was removed
  if (updates.status === 'removed') {
    await createAuditLog({
      user_id: reviewerId,
      action_type: 'content_removed',
      resource_type: data.content_type,
      resource_id: data.content_id,
      details: { flag_id: flagId, reason: data.flag_reason },
    });
  }

  return data;
}

/**
 * Revoke a share link (admin action)
 */
export async function revokeShareLink(shareTokenId: string, adminUserId: string): Promise<void> {
  const { error } = await supabase
    .from('share_tokens')
    .update({ revoked: true })
    .eq('id', shareTokenId);

  if (error) throw error;

  // Log audit event
  await createAuditLog({
    user_id: adminUserId,
    action_type: 'share_link_revoked',
    resource_type: 'share_link',
    resource_id: shareTokenId,
  });
}
