import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useGenerateShareLink } from '@/hooks/useShareLinks';
import { Loader2, Lock, Calendar, Shield } from 'lucide-react';

interface LinkGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionId: string;
  onSuccess?: (token: string) => void;
}

export function LinkGenerationModal({
  open,
  onOpenChange,
  decisionId,
  onSuccess,
}: LinkGenerationModalProps) {
  const [passcode, setPasscode] = useState('');
  const [usePasscode, setUsePasscode] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [useExpiration, setUseExpiration] = useState(false);
  const [allowedActions, setAllowedActions] = useState({
    view: true,
    comment: true,
    confirm: true,
  });

  const generateMutation = useGenerateShareLink();

  const handleGenerate = () => {
    const actions = Object.entries(allowedActions)
      .filter(([_, enabled]) => enabled)
      .map(([action]) => action);

    if (actions.length === 0) {
      return;
    }

    generateMutation.mutate(
      {
        decisionId,
        passcode: usePasscode ? passcode : undefined,
        expiresAt: useExpiration ? expiresAt : undefined,
        allowedActions: actions,
      },
      {
        onSuccess: (data) => {
          onSuccess?.(data.token);
          onOpenChange(false);
          // Reset form
          setPasscode('');
          setUsePasscode(false);
          setExpiresAt('');
          setUseExpiration(false);
        },
      }
    );
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#9D79F9]" />
            Generate Shareable Link
          </DialogTitle>
          <DialogDescription>
            Create a secure link to share this decision with clients. You can protect it with a
            passcode and set an expiration date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Passcode Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-passcode"
                checked={usePasscode}
                onCheckedChange={(checked) => setUsePasscode(checked === true)}
              />
              <Label htmlFor="use-passcode" className="cursor-pointer flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Protect with passcode
              </Label>
            </div>
            {usePasscode && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Clients will need to enter this passcode to access the link.
                </p>
              </div>
            )}
          </div>

          {/* Expiration Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-expiration"
                checked={useExpiration}
                onCheckedChange={(checked) => setUseExpiration(checked === true)}
              />
              <Label htmlFor="use-expiration" className="cursor-pointer flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Set expiration date
              </Label>
            </div>
            {useExpiration && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="expires-at">Expiration Date</Label>
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={minDate}
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  The link will no longer be accessible after this date.
                </p>
              </div>
            )}
          </div>

          {/* Allowed Actions */}
          <div className="space-y-3">
            <Label>Allowed Actions</Label>
            <div className="space-y-2 ml-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="action-view"
                  checked={allowedActions.view}
                  onCheckedChange={(checked) =>
                    setAllowedActions((prev) => ({ ...prev, view: checked === true }))
                  }
                />
                <Label htmlFor="action-view" className="cursor-pointer">
                  View decision
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="action-comment"
                  checked={allowedActions.comment}
                  onCheckedChange={(checked) =>
                    setAllowedActions((prev) => ({ ...prev, comment: checked === true }))
                  }
                />
                <Label htmlFor="action-comment" className="cursor-pointer">
                  Ask questions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="action-confirm"
                  checked={allowedActions.confirm}
                  onCheckedChange={(checked) =>
                    setAllowedActions((prev) => ({ ...prev, confirm: checked === true }))
                  }
                />
                <Label htmlFor="action-confirm" className="cursor-pointer">
                  Confirm choice
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generateMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={
              generateMutation.isPending ||
              (usePasscode && !passcode.trim()) ||
              (useExpiration && !expiresAt) ||
              Object.values(allowedActions).every((v) => !v)
            }
            className="bg-[#9D79F9] hover:bg-[#8B6AE8] text-white"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Link'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
