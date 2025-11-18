import { useAdminOverview } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building2,
  FileText,
  AlertTriangle,
  Clock,
  Flag,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AdminOverview() {
  const { data: overview, isLoading } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-[18px] shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!overview) return null;

  const metrics = [
    {
      title: "Total Users",
      value: overview.total_users,
      icon: Users,
      color: "bg-[#F6FDF6] text-[#5FD37B]",
      trend: `${overview.active_users} active`,
    },
    {
      title: "Active Users",
      value: overview.active_users,
      icon: Users,
      color: "bg-[#F0F8FF] text-[#6AD8FA]",
      trend: "Last 30 days",
    },
    {
      title: "Organizations",
      value: overview.total_organizations,
      icon: Building2,
      color: "bg-[#F4F0FF] text-[#9D79F9]",
    },
    {
      title: "Projects",
      value: overview.total_projects,
      icon: FileText,
      color: "bg-[#FFFBE6] text-[#F6C96B]",
    },
    {
      title: "Total Decisions",
      value: overview.total_decisions,
      icon: FileText,
      color: "bg-[#F6FDF6] text-[#5FD37B]",
    },
    {
      title: "Overdue Decisions",
      value: overview.overdue_decisions,
      icon: Clock,
      color: "bg-[#FFE6E6] text-[#FF7A7A]",
      alert: overview.overdue_decisions > 0,
    },
    {
      title: "Pending Moderation",
      value: overview.pending_moderation_flags,
      icon: Flag,
      color: "bg-[#FFFBE6] text-[#F6C96B]",
      alert: overview.pending_moderation_flags > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Dashboard Overview</h2>
        <p className="text-[#7A7A7A]">
          System metrics and statistics as of {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="rounded-[18px] shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#7A7A7A]">
                  {metric.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", metric.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1A1A1A]">
                    {metric.value.toLocaleString()}
                  </span>
                  {metric.alert && (
                    <AlertTriangle className="h-4 w-4 text-[#FF7A7A]" />
                  )}
                </div>
                {metric.trend && (
                  <p className="text-sm text-[#7A7A7A] mt-1">{metric.trend}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
