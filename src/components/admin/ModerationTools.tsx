import { useState } from "react";
import { useModerationFlags, useUpdateModerationFlag, useRevokeShareLink } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Flag, Trash2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ModerationTools() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [action, setAction] = useState<"remove" | "dismiss" | null>(null);

  const { data: flags = [], isLoading } = useModerationFlags({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50,
  });

  const updateFlag = useUpdateModerationFlag();
  const revokeLink = useRevokeShareLink();

  const handleAction = (flagId: string, actionType: "remove" | "dismiss") => {
    setSelectedFlag(flagId);
    setAction(actionType);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedFlag || !action) return;

    const flag = flags.find((f) => f.id === selectedFlag);
    if (!flag) return;

    if (action === "remove") {
      await updateFlag.mutateAsync({
        flagId: selectedFlag,
        updates: { status: "removed" },
      });
      // If it's a share link, revoke it
      if (flag.content_type === "share_link") {
        await revokeLink.mutateAsync(flag.content_id);
      }
    } else {
      await updateFlag.mutateAsync({
        flagId: selectedFlag,
        updates: { status: "dismissed" },
      });
    }

    setShowConfirmDialog(false);
    setSelectedFlag(null);
    setAction(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Moderation Tools</h2>
        <p className="text-[#7A7A7A]">
          Review and manage flagged content
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 rounded-lg">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flags List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {flags.length === 0 ? (
            <div className="text-center py-12 text-[#7A7A7A]">
              No moderation flags found.
            </div>
          ) : (
            flags.map((flag) => (
              <Card key={flag.id} className="rounded-[18px] shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FFFBE6]">
                        <Flag className="h-5 w-5 text-[#F6C96B]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {flag.content_type.replace(/_/g, " ")}
                        </CardTitle>
                        <p className="text-sm text-[#7A7A7A]">
                          Flagged on {format(new Date(flag.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        flag.status === "pending" && "bg-[#FFFBE6] text-[#F6C96B] border-[#F6C96B]",
                        flag.status === "removed" && "bg-[#FFE6E6] text-[#FF7A7A] border-[#FF7A7A]",
                        flag.status === "dismissed" && "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                      )}
                    >
                      {flag.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A] mb-1">Reason</p>
                      <p className="text-sm text-[#7A7A7A]">{flag.flag_reason}</p>
                    </div>
                    {flag.flag_category && (
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A] mb-1">Category</p>
                        <Badge variant="outline" className="capitalize">
                          {flag.flag_category.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    )}
                    {flag.review_notes && (
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A] mb-1">Review Notes</p>
                        <p className="text-sm text-[#7A7A7A]">{flag.review_notes}</p>
                      </div>
                    )}
                    {flag.status === "pending" && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(flag.id, "remove")}
                          className="text-[#FF7A7A] border-[#FF7A7A] hover:bg-[#FFE6E6]"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(flag.id, "dismiss")}
                          className="text-[#5FD37B] border-[#5FD37B] hover:bg-[#F6FDF6]"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Dismiss Flag
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-[18px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "remove" ? "Remove Content?" : "Dismiss Flag?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "remove"
                ? "This will remove the flagged content. This action cannot be undone."
                : "This will dismiss the flag. The content will remain visible."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={cn(
                action === "remove"
                  ? "bg-[#FF7A7A] hover:bg-[#FF7A7A]/90"
                  : "bg-[#5FD37B] hover:bg-[#5FD37B]/90"
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
