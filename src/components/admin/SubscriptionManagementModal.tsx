import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBillingSubscription, useUpdateBillingSubscription } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";

interface SubscriptionManagementModalProps {
  subscriptionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionManagementModal({
  subscriptionId,
  open,
  onOpenChange,
}: SubscriptionManagementModalProps) {
  const { data: subscription, isLoading } = useBillingSubscription(subscriptionId);
  const updateSubscription = useUpdateBillingSubscription();

  const [planType, setPlanType] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<string>("");
  const [seatsCount, setSeatsCount] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  if (subscription) {
    if (!planType) setPlanType(subscription.plan_type);
    if (!billingCycle) setBillingCycle(subscription.billing_cycle);
    if (!seatsCount) setSeatsCount(subscription.seats_count);
    if (!status) setStatus(subscription.status);
  }

  const handleSave = async () => {
    if (!subscription) return;

    await updateSubscription.mutateAsync({
      subscriptionId,
      updates: {
        plan_type: planType as "free" | "pro" | "enterprise",
        billing_cycle: billingCycle as "monthly" | "yearly",
        seats_count: seatsCount,
        status: status as "active" | "cancelled" | "past_due" | "expired" | "trialing",
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[18px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Manage Subscription
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : subscription ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-type">Plan Type</Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger id="plan-type" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing-cycle">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger id="billing-cycle" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                value={seatsCount}
                onChange={(e) => setSeatsCount(parseInt(e.target.value) || 1)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#5FD37B] hover:bg-[#5FD37B]/90">
                Save Changes
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
