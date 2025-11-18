import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDownloadExport, useDeleteExport } from '@/hooks/useExports';
import { Download, Trash2, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { Export } from '@/api/exports';

interface ExportStatusCardProps {
  export_: Export;
  onDeleted?: () => void;
}

export function ExportStatusCard({ export_, onDeleted }: ExportStatusCardProps) {
  const downloadExport = useDownloadExport();
  const deleteExport = useDeleteExport();

  const handleDownload = () => {
    downloadExport.mutate(export_.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this export?')) {
      deleteExport.mutate(export_.id, {
        onSuccess: () => {
          onDeleted?.();
        },
      });
    }
  };

  const getStatusIcon = () => {
    switch (export_.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-[#5FD37B]" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-[#FF7A7A]" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-[#9D79F9] animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-[#F6C96B]" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, string> = {
      completed: 'bg-[#F6FDF6] text-[#5FD37B] border-[#5FD37B]',
      failed: 'bg-[#FFF5F5] text-[#FF7A7A] border-[#FF7A7A]',
      processing: 'bg-[#F4F0FF] text-[#9D79F9] border-[#9D79F9]',
      pending: 'bg-[#FFFBE6] text-[#F6C96B] border-[#F6C96B]',
    };

    return (
      <Badge
        className={`${variants[export_.status] || variants.pending} border rounded-full px-3 py-1`}
      >
        {export_.status.charAt(0).toUpperCase() + export_.status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg font-bold text-[#1A1A1A]">
              {export_.export_type.toUpperCase()} Export
            </CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-[#7A7A7A]">
          Created {format(new Date(export_.created_at), 'MMM d, yyyy h:mm a')}
          {export_.completed_at &&
            ` • Completed ${format(new Date(export_.completed_at), 'MMM d, yyyy h:mm a')}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-[#7A7A7A]">
            {export_.include_images && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Images included
              </span>
            )}
            {export_.include_audit_trail && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Audit trail included
              </span>
            )}
          </div>

          {export_.file_size && (
            <div className="text-sm text-[#7A7A7A]">
              File size: {(export_.file_size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {export_.status === 'completed' && (
              <Button
                onClick={handleDownload}
                disabled={downloadExport.isPending}
                className="rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white hover:scale-105 transition-transform"
                size="sm"
              >
                {downloadExport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteExport.isPending}
              className="rounded-full hover:scale-105 transition-transform"
              size="sm"
            >
              {deleteExport.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
