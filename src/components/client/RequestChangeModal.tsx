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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';

const changeRequestSchema = z.object({
  changeRequest: z.string().min(20, 'Please provide at least 20 characters describing the change'),
  reason: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type ChangeRequestFormData = z.infer<typeof changeRequestSchema>;

interface RequestChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    changeRequest: string;
    reason?: string;
    name?: string;
    email?: string;
  }) => void;
  requiresDetails: boolean;
  isSubmitting?: boolean;
}

export function RequestChangeModal({
  open,
  onOpenChange,
  onSubmit,
  requiresDetails,
  isSubmitting = false,
}: RequestChangeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: {
      changeRequest: '',
      reason: '',
      name: '',
      email: '',
    },
  });

  const handleFormSubmit = (data: ChangeRequestFormData) => {
    onSubmit({
      changeRequest: data.changeRequest,
      reason: data.reason || undefined,
      name: data.name || undefined,
      email: data.email || undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-orange-600" />
            Request a Change
          </DialogTitle>
          <DialogDescription>
            Describe the change you'd like to request for this decision.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="changeRequest">Change Request *</Label>
            <Textarea
              id="changeRequest"
              {...register('changeRequest')}
              placeholder="Describe the change you'd like to request..."
              rows={5}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.changeRequest && (
              <p className="text-sm text-destructive">{errors.changeRequest.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Why is this change needed?"
              rows={3}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {requiresDetails && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Your Name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Your Email <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
