import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecordAcceptance, useCurrentTermsOfService } from '@/hooks/useTerms';
import { toast } from 'sonner';

interface TosAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  method?: 'signup' | 'post-update' | 'manual';
  version?: string;
}

export function TosAcceptanceDialog({
  open,
  onOpenChange,
  onAccept,
  method = 'manual',
  version,
}: TosAcceptanceDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const { data: terms, isLoading } = useCurrentTermsOfService();
  const recordAcceptance = useRecordAcceptance();

  const tosVersion = version || terms?.version_number || '';

  const handleAccept = async () => {
    if (!accepted) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }

    if (!tosVersion) {
      toast.error('Unable to determine Terms of Service version');
      return;
    }

    try {
      await recordAcceptance.mutateAsync({
        version: tosVersion,
        method,
        metadata: {
          dialog: true,
          timestamp: new Date().toISOString(),
        },
      });

      onAccept?.();
      onOpenChange(false);
      setAccepted(false);
    } catch (error: any) {
      toast.error('Failed to accept Terms of Service', {
        description: error.message,
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAccepted(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Accept Terms of Service
          </DialogTitle>
          <DialogDescription>
            Please review and accept our Terms of Service to continue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">
                By accepting these Terms of Service, you agree to be bound by the terms and conditions
                outlined in our full Terms of Service document.
              </p>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold mb-2">Key Points:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You must use the Service only for lawful purposes</li>
                  <li>• You are responsible for maintaining account security</li>
                  <li>• We reserve the right to modify or terminate the Service</li>
                  <li>• Intellectual property rights are protected</li>
                  <li>• Liability is limited as described in the full Terms</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Read the Full Terms</p>
                <p className="text-xs text-muted-foreground mb-3">
                  For complete details, please review our full Terms of Service document.
                </p>
                <Link
                  to="/terms"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View Full Terms of Service
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-3 pt-4 border-t">
          <Checkbox
            id="tos-accept"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            disabled={recordAcceptance.isPending || isLoading}
            className="mt-1"
          />
          <Label
            htmlFor="tos-accept"
            className="text-sm font-normal leading-relaxed cursor-pointer flex-1"
          >
            I have read and agree to the{' '}
            <Link
              to="/terms"
              target="_blank"
              className="text-primary hover:underline font-medium"
            >
              Terms of Service
            </Link>
            {' '}and understand that I am bound by these terms.
          </Label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={recordAcceptance.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted || recordAcceptance.isPending || isLoading}
          >
            {recordAcceptance.isPending ? (
              'Processing...'
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Accept Terms
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
