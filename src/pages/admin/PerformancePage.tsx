import { Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PerformanceMetrics } from '@/components/performance/PerformanceMetrics';
import { CacheManagementDialog } from '@/components/admin/CacheManagementDialog';
import { IndexConfigurationSheet } from '@/components/admin/IndexConfigurationSheet';

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Performance & Search Optimization</h2>
          <p className="text-[#7A7A7A]">
            Monitor search performance, manage cache, and configure database indices
          </p>
        </div>
        <div className="flex gap-2">
          <CacheManagementDialog
            trigger={
              <Button variant="outline" className="rounded-full">
                <Database className="h-4 w-4 mr-2" />
                Manage Cache
              </Button>
            }
          />
          <IndexConfigurationSheet
            trigger={
              <Button variant="outline" className="rounded-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Indices
              </Button>
            }
          />
        </div>
      </div>

      <PerformanceMetrics />
    </div>
  );
}
