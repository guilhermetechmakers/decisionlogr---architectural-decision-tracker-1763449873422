import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Shield } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function AuditLogs() {
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading } = useAuditLogs({
    action_type: actionTypeFilter !== "all" ? actionTypeFilter : undefined,
    limit: 50,
  });

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action_type.toLowerCase().includes(query) ||
      log.resource_type?.toLowerCase().includes(query) ||
      log.details?.toString().toLowerCase().includes(query)
    );
  });

  const actionTypes = [
    "all",
    "password_reset",
    "link_regenerated",
    "login_attempt",
    "login_success",
    "login_failed",
    "user_suspended",
    "user_activated",
    "role_changed",
    "share_link_revoked",
    "content_removed",
    "billing_updated",
    "subscription_changed",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Audit Logs</h2>
        <p className="text-[#7A7A7A]">
          Security events and administrative actions
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
          <SelectTrigger className="w-48 rounded-lg">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "All Actions" : type.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-[#7A7A7A]">
              No audit logs found.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="rounded-[18px] shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#7A7A7A]" />
                        <Badge
                          variant="outline"
                          className="capitalize"
                        >
                          {log.action_type.replace(/_/g, " ")}
                        </Badge>
                        {log.resource_type && (
                          <span className="text-sm text-[#7A7A7A]">
                            on {log.resource_type}
                          </span>
                        )}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-sm text-[#7A7A7A]">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                      <p className="text-xs text-[#7A7A7A]">
                        {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
