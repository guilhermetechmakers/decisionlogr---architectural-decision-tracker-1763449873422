import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSuspendUser, useActivateUser, useResetUserPassword } from "@/hooks/useAdmin";
import type { AdminUser } from "@/api/admin";
import { Ban, CheckCircle, Key, User, Mail, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserDetailModalProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailModal({ user, open, onOpenChange }: UserDetailModalProps) {
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const resetPassword = useResetUserPassword();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[18px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A1A1A]">
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-[#F4F0FF] flex items-center justify-center">
              <User className="h-8 w-8 text-[#9D79F9]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                {user.full_name || "No name"}
              </h3>
              <p className="text-[#7A7A7A]">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={cn(
                    user.status === "active"
                      ? "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                      : "bg-[#FFE6E6] text-[#FF7A7A] border-[#FF7A7A]"
                  )}
                >
                  {user.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    user.email_verified
                      ? "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                      : "bg-[#FFFBE6] text-[#F6C96B] border-[#F6C96B]"
                  )}
                >
                  {user.email_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="text-[#1A1A1A]">{user.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                <Building2 className="h-4 w-4" />
                Company
              </div>
              <p className="text-[#1A1A1A]">{user.company || "—"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                <User className="h-4 w-4" />
                Role
              </div>
              <Badge variant="outline" className="capitalize">
                {user.role || "—"}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                <Calendar className="h-4 w-4" />
                Last Active
              </div>
              <p className="text-[#1A1A1A]">
                {user.last_active
                  ? format(new Date(user.last_active), "MMM d, yyyy 'at' h:mm a")
                  : "Never"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user.status === "active" ? (
              <Button
                variant="outline"
                onClick={() => {
                  suspendUser.mutate({ userId: user.id });
                  onOpenChange(false);
                }}
                className="text-[#FF7A7A] border-[#FF7A7A] hover:bg-[#FFE6E6]"
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  activateUser.mutate(user.id);
                  onOpenChange(false);
                }}
                className="text-[#5FD37B] border-[#5FD37B] hover:bg-[#F6FDF6]"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate User
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                resetPassword.mutate(user.id);
              }}
            >
              <Key className="mr-2 h-4 w-4" />
              Reset Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
