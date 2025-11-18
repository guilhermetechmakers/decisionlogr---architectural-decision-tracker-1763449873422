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
import { useUpdateOption } from '@/hooks/useDecision';
import type { Option } from '@/api/decisions';

const optionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  specs: z.record(z.any()).optional(),
  cost_delta_numeric: z.number().nullable().optional(),
  pros_cons_text: z.string().nullable().optional(),
  is_default: z.boolean().optional(),
});

type OptionFormData = z.infer<typeof optionSchema>;

interface EditOptionModalProps {
  option: Option;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOptionModal({ option, open, onOpenChange }: EditOptionModalProps) {
  const updateOption = useUpdateOption();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OptionFormData>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      title: option.title,
      specs: option.specs || {},
      cost_delta_numeric: option.cost_delta_numeric,
      pros_cons_text: option.pros_cons_text || '',
      is_default: option.is_default,
    },
  });

  const onSubmit = async (data: OptionFormData) => {
    try {
      await updateOption.mutateAsync({
        optionId: option.id,
        updates: {
          title: data.title,
          specs: data.specs,
          cost_delta_numeric: data.cost_delta_numeric,
          pros_cons_text: data.pros_cons_text,
          is_default: data.is_default,
        },
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Option</DialogTitle>
          <DialogDescription>Update the option details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Option name"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_delta">Cost Impact ($)</Label>
            <Input
              id="cost_delta"
              type="number"
              step="0.01"
              {...register('cost_delta_numeric', {
                valueAsNumber: true,
              })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pros_cons">Pros & Cons</Label>
            <Textarea
              id="pros_cons"
              {...register('pros_cons_text')}
              placeholder="Brief pros and cons..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
