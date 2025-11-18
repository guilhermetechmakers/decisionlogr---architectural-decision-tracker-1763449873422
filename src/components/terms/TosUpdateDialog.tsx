import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, ExternalLink, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecordAcceptance, useCurrentTermsOfService, useAcceptanceStatus } from '@/hooks/useTerms';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TosUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function TosUpdateDialog({ open, onOpenChange, onAccept }: TosUpdateDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const { data: terms, isLoading: termsLoading } = useCurrentTermsOfService();
  const { data: acceptanceStatus, isLoading: statusLoading } = useAcceptanceStatus();
  const recordAcceptance = useRecordAcceptance();

  const isLoading = termsLoading || statusLoading;

  // Check if user needs to accept
  useEffect(() => {
    if (acceptanceStatus?.needsAcceptance && terms) {
      // Auto-open if user needs to accept
      if (!open) {
        onOpenChange(true);
      }
    }
  }, [acceptanceStatus, terms, open, onOpenChange]);

  const handleAccept = async () => {
    if (!accepted) {
      toast.error('Please accept the updated Terms of Service to continue');
      return;
    }

    if (!terms) {
      toast.error('Unable to load Terms of Service');
      return;
    }

    try {
      await recordAcceptance.mutateAsync({
        version: terms.version_number,
        method: 'post-update',
        metadata: {
          previousVersion: acceptanceStatus?.userAcceptedVersion || null,
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

  if (!terms || !acceptanceStatus?.needsAcceptance) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Terms of Service Updated
          </DialogTitle>
          <DialogDescription>
            Our Terms of Service have been updated. Please review and accept the new terms to continue using the service.
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> You must accept the updated Terms of Service (Version {terms.version_number})
            to continue using DecisionLogr.
          </AlertDescription>
        </Alert>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">What Changed?</h4>
                    <p className="text-sm text-muted-foreground">
                      Our Terms of Service have been updated effective{' '}
                      <strong>{format(new Date(terms.effective_date), 'MMMM d, yyyy')}</strong>.
                      Please review the full document to understand all changes.
                    </p>
                  </div>
                </div>
                {acceptanceStatus.userAcceptedVersion && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You previously accepted version {acceptanceStatus.userAcceptedVersion}.
                  </p>
                )}
              </div>

              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2 text-sm">Important Reminders:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Review the updated Terms of Service carefully</li>
                  <li>• Your continued use of the Service constitutes acceptance</li>
                  <li>• You can access the full document at any time</li>
                  <li>• Contact us if you have questions about the changes</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Read the Full Updated Terms</p>
                <p className="text-xs text-muted-foreground mb-3">
                  For complete details about all changes, please review our full Terms of Service document.
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
            id="tos-update-accept"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            disabled={recordAcceptance.isPending || isLoading}
            className="mt-1"
          />
          <Label
            htmlFor="tos-update-accept"
            className="text-sm font-normal leading-relaxed cursor-pointer flex-1"
          >
            I have read and agree to the updated{' '}
            <Link
              to="/terms"
              target="_blank"
              className="text-primary hover:underline font-medium"
            >
              Terms of Service
            </Link>
            {' '}(Version {terms.version_number}) and understand that I am bound by these terms.
          </Label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={recordAcceptance.isPending}
          >
            Review Later
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
                Accept Updated Terms
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
