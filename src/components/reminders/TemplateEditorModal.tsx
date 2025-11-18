import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/useReminders';
import type { ReminderTemplateInsertInput, ReminderTemplateUpdate } from '@/api/reminders';

const templateSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  is_default: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  initialData?: {
    template_name: string;
    subject: string;
    content: string;
    is_default: boolean;
  };
}

export function TemplateEditorModal({
  open,
  onOpenChange,
  templateId,
  initialData,
}: TemplateEditorModalProps) {
  const [isEditing] = useState(!!templateId);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      template_name: initialData?.template_name || '',
      subject: initialData?.subject || '',
      content: initialData?.content || '',
      is_default: initialData?.is_default || false,
    },
  });

  const isDefault = watch('is_default');

  useEffect(() => {
    if (open && initialData) {
      reset(initialData);
    } else if (open && !initialData) {
      reset({
        template_name: '',
        subject: '',
        content: '',
        is_default: false,
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (isEditing && templateId) {
        const updateData: ReminderTemplateUpdate = {
          template_name: data.template_name,
          subject: data.subject,
          content: data.content,
          is_default: data.is_default,
        };
        await updateTemplate.mutateAsync({ templateId, updates: updateData });
      } else {
        const templateData: ReminderTemplateInsertInput = {
          template_name: data.template_name,
          subject: data.subject,
          content: data.content,
          is_default: data.is_default,
        };
        await createTemplate.mutateAsync(templateData);
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            Create a customizable email template for reminders. Use variables like{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {'{{decision_title}}'}
            </code>
            ,{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {'{{required_by}}'}
            </code>
            , and{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {'{{project_name}}'}
            </code>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name *</Label>
            <Input
              id="template_name"
              {...register('template_name')}
              placeholder="e.g., Weekly Reminder"
            />
            {errors.template_name && (
              <p className="text-sm text-destructive">{errors.template_name.message}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g., Reminder: {{decision_title}} due soon"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Email Content *</Label>
            <Textarea
              id="content"
              {...register('content')}
              rows={12}
              placeholder="Enter your email template content here..."
              className="font-mono text-sm"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Available variables: {'{{decision_title}}'}, {'{{required_by}}'}, {'{{project_name}}'}, {'{{area}}'}
            </p>
          </div>

          {/* Default Template */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={(checked) => setValue('is_default', checked === true)}
            />
            <Label
              htmlFor="is_default"
              className="text-sm font-normal cursor-pointer"
            >
              Set as default template
            </Label>
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
