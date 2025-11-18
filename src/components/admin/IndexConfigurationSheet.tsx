import { useState } from 'react';
import { Database, RefreshCw, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useSearchIndices,
  useAnalyzeIndex,
  useDeleteSearchIndex,
} from '@/hooks/usePerformance';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface IndexConfigurationSheetProps {
  trigger?: React.ReactNode;
}

export function IndexConfigurationSheet({ trigger }: IndexConfigurationSheetProps) {
  const [open, setOpen] = useState(false);
  const { data: indices, isLoading } = useSearchIndices();
  const analyzeIndex = useAnalyzeIndex();
  const deleteIndex = useDeleteSearchIndex();

  const handleAnalyze = async (indexId: string) => {
    await analyzeIndex.mutateAsync(indexId);
  };

  const handleDelete = async (indexId: string) => {
    if (confirm('Are you sure you want to delete this index metadata? This will not delete the actual database index.')) {
      await deleteIndex.mutateAsync(indexId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Search Index Configuration
          </DialogTitle>
          <DialogDescription>
            Manage database indices used for search optimization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : indices && indices.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Index Name</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Columns</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Analyzed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indices.map((index) => (
                    <TableRow key={index.id}>
                      <TableCell className="font-medium">{index.index_name}</TableCell>
                      <TableCell>{index.table_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {index.column_names.map((col, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">
                          {index.index_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={index.is_active ? 'default' : 'secondary'}
                          className="rounded-full"
                        >
                          {index.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {index.last_analyzed
                          ? format(new Date(index.last_analyzed), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAnalyze(index.id)}
                            disabled={analyzeIndex.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index.id)}
                            disabled={deleteIndex.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No search indices configured
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
