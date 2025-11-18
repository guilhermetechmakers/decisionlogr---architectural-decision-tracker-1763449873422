import { useState } from 'react';
import { Trash2, RefreshCw, Database } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCacheStats, useClearCache } from '@/hooks/useSearch';
import { Skeleton } from '@/components/ui/skeleton';

interface CacheManagementDialogProps {
  trigger?: React.ReactNode;
}

export function CacheManagementDialog({ trigger }: CacheManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: stats, isLoading } = useCacheStats();
  const clearCache = useClearCache();

  const handleClearAll = async () => {
    await clearCache.mutateAsync(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Management
          </DialogTitle>
          <DialogDescription>
            View and manage cached search results to optimize performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : stats ? (
            <>
              {/* Cache Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalEntries}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.activeEntries}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Expired Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {stats.expiredEntries}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Hits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalHits}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg: {stats.averageHitCount} hits/entry
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Cache helps improve search performance by storing frequently accessed results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={clearCache.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Cache
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No cache statistics available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
