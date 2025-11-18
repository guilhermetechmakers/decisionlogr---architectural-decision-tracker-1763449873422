import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useShareTokensForDecision,
  useRevokeShareToken,
  useRegenerateShareToken,
  useExtendShareTokenExpiration,
} from '@/hooks/useShareLinks';
import { Copy, Trash2, RefreshCw, Calendar, ExternalLink, Eye, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LinkManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionId: string;
}

export function LinkManagementDialog({
  open,
  onOpenChange,
  decisionId,
}: LinkManagementDialogProps) {
  const { data: tokens, isLoading } = useShareTokensForDecision(decisionId);
  const revokeMutation = useRevokeShareToken();
  const regenerateMutation = useRegenerateShareToken();
  const extendMutation = useExtendShareTokenExpiration();

  const [extendingTokenId, setExtendingTokenId] = useState<string | null>(null);
  const [newExpiresAt, setNewExpiresAt] = useState('');

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleRevoke = (tokenId: string) => {
    if (confirm('Are you sure you want to revoke this link? Clients will no longer be able to access it.')) {
      revokeMutation.mutate(tokenId);
    }
  };

  const handleRegenerate = (tokenId: string) => {
    if (confirm('This will revoke the current link and create a new one. Continue?')) {
      regenerateMutation.mutate({ oldTokenId: tokenId });
    }
  };

  const handleExtend = (tokenId: string) => {
    if (!newExpiresAt) return;
    extendMutation.mutate(
      { tokenId, newExpiresAt },
      {
        onSuccess: () => {
          setExtendingTokenId(null);
          setNewExpiresAt('');
        },
      }
    );
  };

  const getStatusBadge = (token: NonNullable<typeof tokens>[0]) => {
    if (token.revoked) {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (token.expires_at) {
      return <Badge variant="secondary">Active (Expires {format(new Date(token.expires_at), 'MMM d, yyyy')})</Badge>;
    }
    return <Badge className="bg-[#5FD37B] text-white">Active</Badge>;
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Share Links</DialogTitle>
          <DialogDescription>
            View and manage all shareable links for this decision
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : !tokens || tokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No share links generated yet
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="border rounded-lg p-4 space-y-3 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(token)}
                        {token.passcode_hash && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Passcode Protected
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {format(new Date(token.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono bg-muted p-2 rounded">
                        <span className="truncate">{window.location.origin}/share/{token.token}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </span>
                        {token.allowed_actions.includes('comment') && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Comment
                          </span>
                        )}
                        {token.allowed_actions.includes('confirm') && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Confirm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(token.token)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = `${window.location.origin}/share/${token.token}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {!token.revoked && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRegenerate(token.id)}
                          disabled={regenerateMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExtendingTokenId(token.id);
                            if (token.expires_at) {
                              setNewExpiresAt(new Date(token.expires_at).toISOString().slice(0, 16));
                            }
                          }}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRevoke(token.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {extendingTokenId === token.id && (
                    <div className="pt-3 border-t space-y-2">
                      <Label htmlFor={`extend-${token.id}`}>New Expiration Date</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`extend-${token.id}`}
                          type="datetime-local"
                          value={newExpiresAt}
                          onChange={(e) => setNewExpiresAt(e.target.value)}
                          min={minDate}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleExtend(token.id)}
                          disabled={!newExpiresAt || extendMutation.isPending}
                          className="bg-[#9D79F9] hover:bg-[#8B6AE8] text-white"
                        >
                          {extendMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Extend'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExtendingTokenId(null);
                            setNewExpiresAt('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
