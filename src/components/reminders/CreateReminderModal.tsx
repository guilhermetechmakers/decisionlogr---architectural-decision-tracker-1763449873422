import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateReminder, useUpdateReminder, useTemplates, useReminder } from '@/hooks/useReminders';
import { useDecisions } from '@/hooks/useDecision';
import type { ReminderInsertInput, ReminderUpdate } from '@/api/reminders';
import { Calendar } from 'lucide-react';

const reminderSchema = z.object({
  decision_id: z.string().min(1, 'Please select a decision'),
  template_id: z.string().optional().nullable(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  custom_interval_days: z.number().min(1).optional().nullable(),
  next_reminder_date: z.string().min(1, 'Please select a date'),
  notification_channels: z.array(z.string()).min(1, 'Select at least one channel'),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface CreateReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminderId?: string;
  initialDecisionId?: string;
}

export function CreateReminderModal({
  open,
  onOpenChange,
  reminderId,
  initialDecisionId,
}: CreateReminderModalProps) {
  const [isEditing] = useState(!!reminderId);
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const { data: templates } = useTemplates();
  const { data: decisions } = useDecisions();
  const { data: existingReminder } = useReminder(reminderId || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      decision_id: initialDecisionId || '',
      template_id: null,
      frequency: 'weekly',
      custom_interval_days: null,
      next_reminder_date: format(new Date(), 'yyyy-MM-dd'),
      notification_channels: ['email'],
    },
  });

  const frequency = watch('frequency');
  const notificationChannels = watch('notification_channels') || [];

  useEffect(() => {
    if (open && initialDecisionId) {
      setValue('decision_id', initialDecisionId);
    }
    if (open && existingReminder) {
      setValue('decision_id', existingReminder.decision_id);
      setValue('template_id', existingReminder.template_id || null);
      setValue('frequency', existingReminder.frequency);
      setValue('custom_interval_days', existingReminder.custom_interval_days);
      setValue('next_reminder_date', existingReminder.next_reminder_date);
      setValue('notification_channels', existingReminder.notification_channels);
    }
  }, [open, initialDecisionId, existingReminder, setValue]);

  const onSubmit = async (data: ReminderFormData) => {
    try {
      const reminderData: ReminderInsertInput = {
        decision_id: data.decision_id,
        template_id: data.template_id || null,
        frequency: data.frequency,
        custom_interval_days: data.frequency === 'custom' ? data.custom_interval_days : null,
        next_reminder_date: data.next_reminder_date,
        notification_channels: data.notification_channels,
        status: 'active',
      };

      if (isEditing && reminderId) {
        const updateData: ReminderUpdate = {
          ...reminderData,
        };
        await updateReminder.mutateAsync({ reminderId, updates: updateData });
      } else {
        await createReminder.mutateAsync(reminderData);
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save reminder:', error);
    }
  };

  const toggleChannel = (channel: string) => {
    const current = notificationChannels;
    if (current.includes(channel)) {
      setValue('notification_channels', current.filter(c => c !== channel));
    } else {
      setValue('notification_channels', [...current, channel]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Edit Reminder' : 'Create New Reminder'}
          </DialogTitle>
          <DialogDescription>
            Configure automated reminders for decision deadlines
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Decision Selection */}
          <div className="space-y-2">
            <Label htmlFor="decision_id">Decision *</Label>
            <Select
              value={watch('decision_id')}
              onValueChange={(value) => setValue('decision_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a decision" />
              </SelectTrigger>
              <SelectContent>
                {decisions?.map((decision) => (
                  <SelectItem key={decision.id} value={decision.id}>
                    {decision.title} - {format(new Date(decision.required_by), 'MMM dd, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.decision_id && (
              <p className="text-sm text-destructive">{errors.decision_id.message}</p>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template_id">Email Template (Optional)</Label>
            <Select
              value={watch('template_id') || ''}
              onValueChange={(value) => setValue('template_id', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Use default template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use default template</SelectItem>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.template_name}
                    {template.is_default && ' (Default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Reminder Frequency *</Label>
            <Select
              value={frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'custom') => setValue('frequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Interval</SelectItem>
              </SelectContent>
            </Select>
            {errors.frequency && (
              <p className="text-sm text-destructive">{errors.frequency.message}</p>
            )}
          </div>

          {/* Custom Interval Days */}
          {frequency === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom_interval_days">Days Between Reminders *</Label>
              <Input
                type="number"
                min="1"
                {...register('custom_interval_days', { valueAsNumber: true })}
                placeholder="e.g., 3"
              />
              {errors.custom_interval_days && (
                <p className="text-sm text-destructive">{errors.custom_interval_days.message}</p>
              )}
            </div>
          )}

          {/* Next Reminder Date */}
          <div className="space-y-2">
            <Label htmlFor="next_reminder_date">Next Reminder Date *</Label>
            <div className="relative">
              <Input
                type="date"
                {...register('next_reminder_date')}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {errors.next_reminder_date && (
              <p className="text-sm text-destructive">{errors.next_reminder_date.message}</p>
            )}
          </div>

          {/* Notification Channels */}
          <div className="space-y-3">
            <Label>Notification Channels *</Label>
            <div className="space-y-2">
              {['email', 'sms', 'app'].map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel}`}
                    checked={notificationChannels.includes(channel)}
                    onCheckedChange={() => toggleChannel(channel)}
                  />
                  <Label
                    htmlFor={`channel-${channel}`}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {channel}
                  </Label>
                </div>
              ))}
            </div>
            {errors.notification_channels && (
              <p className="text-sm text-destructive">{errors.notification_channels.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Reminder' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
