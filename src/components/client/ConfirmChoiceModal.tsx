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
import { CheckCircle2 } from 'lucide-react';

const confirmSchema = z.object({
  name: z.string().min(1, 'Name is required').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type ConfirmFormData = z.infer<typeof confirmSchema>;

interface ConfirmChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { name?: string; email?: string }) => void;
  optionTitle: string;
  requiresDetails: boolean;
  isSubmitting?: boolean;
}

export function ConfirmChoiceModal({
  open,
  onOpenChange,
  onConfirm,
  optionTitle,
  requiresDetails,
  isSubmitting = false,
}: ConfirmChoiceModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (data: ConfirmFormData) => {
    onConfirm({
      name: data.name || undefined,
      email: data.email || undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Confirm Your Choice
          </DialogTitle>
          <DialogDescription>
            You are about to confirm your selection: <strong>{optionTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Once confirmed, this choice will be recorded and the architect will be notified.
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Confirming...' : 'Confirm Choice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
