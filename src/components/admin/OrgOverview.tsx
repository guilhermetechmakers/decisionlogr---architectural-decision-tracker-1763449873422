import { useOrganizationsWithMetrics } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FolderOpen, Link2, Users, Database } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function OrgOverview() {
  const { data: orgs = [], isLoading } = useOrganizationsWithMetrics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Organizations</h2>
        <p className="text-[#7A7A7A]">
          Overview of all organizations and their metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orgs.map((org) => (
          <Card key={org.organization_id} className="rounded-[18px] shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F4F0FF]">
                    <Building2 className="h-5 w-5 text-[#9D79F9]" />
                  </div>
                  <CardTitle className="text-xl">{org.organization_name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                    <FolderOpen className="h-4 w-4" />
                    Projects
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {org.project_count}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                    <FolderOpen className="h-4 w-4" />
                    Decisions
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {org.active_decisions_count}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                    <Link2 className="h-4 w-4" />
                    Share Links
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {org.share_links_count}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                    <Users className="h-4 w-4" />
                    Users
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {org.user_count}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
                    <Database className="h-4 w-4" />
                    Storage
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">
                    {formatBytes(org.storage_used_bytes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orgs.length === 0 && (
        <div className="text-center py-12 text-[#7A7A7A]">
          No organizations found.
        </div>
      )}
    </div>
  );
}
