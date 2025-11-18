import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { usePauseReminder, useCancelReminder } from '@/hooks/useReminders';

interface OptOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminderId: string;
  action: 'pause' | 'cancel';
}

export function OptOutDialog({ open, onOpenChange, reminderId, action }: OptOutDialogProps) {
  const pauseReminder = usePauseReminder();
  const cancelReminder = useCancelReminder();

  const handleConfirm = async () => {
    try {
      if (action === 'pause') {
        await pauseReminder.mutateAsync(reminderId);
      } else {
        await cancelReminder.mutateAsync(reminderId);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'pause' ? 'Pause Reminder' : 'Cancel Reminder'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'pause'
              ? 'This reminder will be paused and will not send notifications until you resume it. You can resume it anytime from the reminder settings.'
              : 'This reminder will be permanently cancelled and cannot be resumed. You will need to create a new reminder if you want to receive notifications again.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Active</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              variant={action === 'cancel' ? 'destructive' : 'default'}
            >
              {action === 'pause' ? 'Pause' : 'Cancel Reminder'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
