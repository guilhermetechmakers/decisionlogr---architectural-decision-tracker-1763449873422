import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Reminder = Database['public']['Tables']['reminders']['Row'];
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert'];
export type ReminderUpdate = Database['public']['Tables']['reminders']['Update'];
export type ReminderTemplate = Database['public']['Tables']['reminder_templates']['Row'];
export type ReminderTemplateInsert = Database['public']['Tables']['reminder_templates']['Insert'];
export type ReminderTemplateUpdate = Database['public']['Tables']['reminder_templates']['Update'];

// Types for component usage (user_id is handled by API)
export type ReminderInsertInput = Omit<ReminderInsert, 'user_id'>;
export type ReminderTemplateInsertInput = Omit<ReminderTemplateInsert, 'user_id'>;

export interface ReminderWithRelations extends Reminder {
  decision: {
    id: string;
    title: string;
    required_by: string;
    status: string;
  };
  template: ReminderTemplate | null;
}

export interface ReminderListParams {
  decisionId?: string;
  status?: Reminder['status'];
  limit?: number;
  offset?: number;
}

/**
 * Get a single reminder with related data
 */
export async function getReminder(reminderId: string): Promise<ReminderWithRelations> {
  const { data: reminder, error: reminderError } = await supabase
    .from('reminders')
    .select('*')
    .eq('id', reminderId)
    .single();

  if (reminderError) throw reminderError;
  if (!reminder) throw new Error('Reminder not found');

  // Fetch related data
  const [decisionResult, templateResult] = await Promise.all([
    supabase
      .from('decisions')
      .select('id, title, required_by, status')
      .eq('id', reminder.decision_id)
      .single(),
    reminder.template_id
      ? supabase
          .from('reminder_templates')
          .select('*')
          .eq('id', reminder.template_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (decisionResult.error) throw decisionResult.error;
  if (!decisionResult.data) throw new Error('Decision not found');

  return {
    ...reminder,
    decision: decisionResult.data,
    template: templateResult.data,
  };
}

/**
 * List reminders with filters
 */
export async function listReminders(params: ReminderListParams = {}): Promise<ReminderWithRelations[]> {
  let query = supabase
    .from('reminders')
    .select('*');

  if (params.decisionId) {
    query = query.eq('decision_id', params.decisionId);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  query = query.order('next_reminder_date', { ascending: true });

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data: reminders, error } = await query;

  if (error) throw error;
  if (!reminders || reminders.length === 0) return [];

  // Fetch related data for all reminders
  const decisionIds = [...new Set(reminders.map(r => r.decision_id))];
  const templateIds = [...new Set(reminders.map(r => r.template_id).filter(Boolean))];

  const [decisionsResult, templatesResult] = await Promise.all([
    supabase
      .from('decisions')
      .select('id, title, required_by, status')
      .in('id', decisionIds),
    templateIds.length > 0
      ? supabase
          .from('reminder_templates')
          .select('*')
          .in('id', templateIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (decisionsResult.error) throw decisionsResult.error;
  if (templatesResult.error) throw templatesResult.error;

  const decisionsMap = new Map((decisionsResult.data || []).map(d => [d.id, d]));
  const templatesMap = new Map((templatesResult.data || []).map(t => [t.id, t]));

  return reminders.map(reminder => ({
    ...reminder,
    decision: decisionsMap.get(reminder.decision_id)!,
    template: reminder.template_id ? templatesMap.get(reminder.template_id) || null : null,
  }));
}

/**
 * Create a new reminder
 */
export async function createReminder(reminder: ReminderInsertInput): Promise<ReminderWithRelations> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const reminderWithUserId = {
    ...reminder,
    user_id: user.user.id,
  };

  const { data: newReminder, error } = await supabase
    .from('reminders')
    .insert(reminderWithUserId)
    .select()
    .single();

  if (error) throw error;
  if (!newReminder) throw new Error('Failed to create reminder');

  return getReminder(newReminder.id);
}

/**
 * Update a reminder
 */
export async function updateReminder(reminderId: string, updates: ReminderUpdate): Promise<ReminderWithRelations> {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', reminderId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Reminder not found');

  return getReminder(reminderId);
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId);

  if (error) throw error;
}

/**
 * Pause a reminder
 */
export async function pauseReminder(reminderId: string): Promise<ReminderWithRelations> {
  return updateReminder(reminderId, { status: 'paused' });
}

/**
 * Resume a reminder
 */
export async function resumeReminder(reminderId: string): Promise<ReminderWithRelations> {
  return updateReminder(reminderId, { status: 'active' });
}

/**
 * Cancel a reminder
 */
export async function cancelReminder(reminderId: string): Promise<ReminderWithRelations> {
  return updateReminder(reminderId, { status: 'cancelled' });
}

/**
 * Get all templates for the current user
 */
export async function listTemplates(): Promise<ReminderTemplate[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reminder_templates')
    .select('*')
    .eq('user_id', user.user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single template
 */
export async function getTemplate(templateId: string): Promise<ReminderTemplate> {
  const { data, error } = await supabase
    .from('reminder_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Template not found');
  return data;
}

/**
 * Create a new template
 */
export async function createTemplate(template: ReminderTemplateInsertInput): Promise<ReminderTemplate> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const templateWithUserId = {
    ...template,
    user_id: user.user.id,
  };

  // If this is set as default, unset other defaults
  if (template.is_default) {
    await supabase
      .from('reminder_templates')
      .update({ is_default: false })
      .eq('user_id', user.user.id)
      .eq('is_default', true);
  }

  const { data: newTemplate, error } = await supabase
    .from('reminder_templates')
    .insert(templateWithUserId)
    .select()
    .single();

  if (error) throw error;
  if (!newTemplate) throw new Error('Failed to create template');
  return newTemplate;
}

/**
 * Update a template
 */
export async function updateTemplate(templateId: string, updates: ReminderTemplateUpdate): Promise<ReminderTemplate> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  // If setting as default, unset other defaults
  if (updates.is_default) {
    await supabase
      .from('reminder_templates')
      .update({ is_default: false })
      .eq('user_id', user.user.id)
      .eq('is_default', true)
      .neq('id', templateId);
  }

  const { data, error } = await supabase
    .from('reminder_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Template not found');
  return data;
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('reminder_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}

/**
 * Get default template for user
 */
export async function getDefaultTemplate(): Promise<ReminderTemplate | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reminder_templates')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
