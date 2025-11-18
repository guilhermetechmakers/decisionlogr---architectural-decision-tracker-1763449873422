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
import { MessageCircle } from 'lucide-react';

const questionSchema = z.object({
  question: z.string().min(10, 'Please provide at least 10 characters'),
  name: z.string().min(1, 'Name is required').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface AskQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { question: string; name?: string; email?: string }) => void;
  requiresDetails: boolean;
  isSubmitting?: boolean;
}

export function AskQuestionModal({
  open,
  onOpenChange,
  onSubmit,
  requiresDetails,
  isSubmitting = false,
}: AskQuestionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
      name: '',
      email: '',
    },
  });

  const handleFormSubmit = (data: QuestionFormData) => {
    onSubmit({
      question: data.question,
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
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Ask a Question
          </DialogTitle>
          <DialogDescription>
            Have a question about this decision? Ask the architect and they'll respond.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Your Question *</Label>
            <Textarea
              id="question"
              {...register('question')}
              placeholder="What would you like to know about this decision?"
              rows={5}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question.message}</p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
