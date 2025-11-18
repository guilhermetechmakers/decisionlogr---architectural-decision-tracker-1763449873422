import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getReminder,
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  pauseReminder,
  resumeReminder,
  cancelReminder,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplate,
  type ReminderListParams,
  type ReminderInsertInput,
  type ReminderUpdate,
  type ReminderTemplateInsertInput,
  type ReminderTemplateUpdate,
} from '@/api/reminders';

/**
 * Get a single reminder with relations
 */
export function useReminder(reminderId: string | null) {
  return useQuery({
    queryKey: ['reminder', reminderId],
    queryFn: () => getReminder(reminderId!),
    enabled: !!reminderId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * List reminders with filters
 */
export function useReminders(params: ReminderListParams = {}) {
  return useQuery({
    queryKey: ['reminders', params],
    queryFn: () => listReminders(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new reminder
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminder: ReminderInsertInput) => createReminder(reminder),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.setQueryData(['reminder', data.id], data);
      toast.success('Reminder created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create reminder');
    },
  });
}

/**
 * Update a reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, updates }: { reminderId: string; updates: ReminderUpdate }) =>
      updateReminder(reminderId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.setQueryData(['reminder', data.id], data);
      toast.success('Reminder updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update reminder');
    },
  });
}

/**
 * Delete a reminder
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: (_, reminderId) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.removeQueries({ queryKey: ['reminder', reminderId] });
      toast.success('Reminder deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete reminder');
    },
  });
}

/**
 * Pause a reminder
 */
export function usePauseReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pauseReminder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.setQueryData(['reminder', data.id], data);
      toast.success('Reminder paused');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause reminder');
    },
  });
}

/**
 * Resume a reminder
 */
export function useResumeReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resumeReminder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.setQueryData(['reminder', data.id], data);
      toast.success('Reminder resumed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resume reminder');
    },
  });
}

/**
 * Cancel a reminder
 */
export function useCancelReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReminder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.setQueryData(['reminder', data.id], data);
      toast.success('Reminder cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel reminder');
    },
  });
}

/**
 * List all templates for current user
 */
export function useTemplates() {
  return useQuery({
    queryKey: ['reminder-templates'],
    queryFn: listTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single template
 */
export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['reminder-template', templateId],
    queryFn: () => getTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get default template
 */
export function useDefaultTemplate() {
  return useQuery({
    queryKey: ['reminder-template', 'default'],
    queryFn: getDefaultTemplate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: ReminderTemplateInsertInput) => createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-templates'] });
      queryClient.invalidateQueries({ queryKey: ['reminder-template', 'default'] });
      toast.success('Template created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });
}

/**
 * Update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: ReminderTemplateUpdate }) =>
      updateTemplate(templateId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminder-templates'] });
      queryClient.invalidateQueries({ queryKey: ['reminder-template', 'default'] });
      queryClient.setQueryData(['reminder-template', data.id], data);
      toast.success('Template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

/**
 * Delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: ['reminder-templates'] });
      queryClient.invalidateQueries({ queryKey: ['reminder-template', 'default'] });
      queryClient.removeQueries({ queryKey: ['reminder-template', templateId] });
      toast.success('Template deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });
}
