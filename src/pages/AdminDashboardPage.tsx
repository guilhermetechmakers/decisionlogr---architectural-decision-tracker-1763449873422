import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { OrgOverview } from "@/components/admin/OrgOverview";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { BillingManagement } from "@/components/admin/BillingManagement";
import { ModerationTools } from "@/components/admin/ModerationTools";
import { EnhancedNavbar } from "@/components/dashboard/EnhancedNavbar";
import PerformancePage from "@/pages/admin/PerformancePage";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <EnhancedNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserManagementTable />} />
            <Route path="organizations" element={<OrgOverview />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="billing" element={<BillingManagement />} />
            <Route path="moderation" element={<ModerationTools />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
