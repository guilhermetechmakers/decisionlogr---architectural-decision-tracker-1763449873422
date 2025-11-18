import { useState } from "react";
import { useBillingSubscriptions, useBillingInvoices } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Download, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SubscriptionManagementModal } from "./SubscriptionManagementModal";

export function BillingManagement() {
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useBillingSubscriptions();
  const { data: invoices = [], isLoading: invoicesLoading } = useBillingInvoices();

  const formatCurrency = (cents: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cents / 100);
  };

  if (subscriptionsLoading || invoicesLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Billing & Subscriptions</h2>
        <p className="text-[#7A7A7A]">
          Manage organization subscriptions and view invoice history
        </p>
      </div>

      {/* Subscriptions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Active Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 text-[#7A7A7A]">
            No active subscriptions found.
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className="rounded-[18px] shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F4F0FF]">
                      <CreditCard className="h-5 w-5 text-[#9D79F9]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
                      </CardTitle>
                      <p className="text-sm text-[#7A7A7A]">
                        {subscription.billing_cycle}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      subscription.status === "active"
                        ? "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                        : "bg-[#FFFBE6] text-[#F6C96B] border-[#F6C96B]"
                    )}
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-[#7A7A7A]">Amount</p>
                    <p className="text-lg font-bold text-[#1A1A1A]">
                      {formatCurrency(subscription.amount_cents, subscription.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A]">Seats</p>
                    <p className="text-lg font-bold text-[#1A1A1A]">
                      {subscription.seats_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A]">Period Start</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {format(new Date(subscription.current_period_start), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A]">Period End</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubscription(subscription.id);
                    setShowSubscriptionModal(true);
                  }}
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invoices */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Invoice History</h3>
        {invoices.length === 0 ? (
          <div className="text-center py-12 text-[#7A7A7A]">
            No invoices found.
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="rounded-[18px] shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-5 w-5 text-[#7A7A7A]" />
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          Invoice #{invoice.invoice_number}
                        </p>
                        <p className="text-sm text-[#7A7A7A]">
                          {format(new Date(invoice.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-[#1A1A1A]">
                        {formatCurrency(invoice.amount_cents, invoice.currency)}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          invoice.status === "paid"
                            ? "bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]"
                            : "bg-[#FFFBE6] text-[#F6C96B] border-[#F6C96B]"
                        )}
                      >
                        {invoice.status}
                      </Badge>
                      {invoice.pdf_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Management Modal */}
      {showSubscriptionModal && selectedSubscription && (
        <SubscriptionManagementModal
          subscriptionId={selectedSubscription}
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        />
      )}
    </div>
  );
}
