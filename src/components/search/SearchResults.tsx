import { AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { SearchResult } from '@/api/search';

interface SearchResultsProps {
  results: SearchResult | null;
  isLoading: boolean;
  onDecisionClick?: (decisionId: string) => void;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  pending: { label: 'Pending', variant: 'outline', color: '#F6C96B' },
  waiting_for_client: { label: 'Waiting for Client', variant: 'secondary', color: '#6AD8FA' },
  decided: { label: 'Decided', variant: 'default', color: '#5FD37B' },
  overdue: { label: 'Overdue', variant: 'destructive', color: '#FF7A7A' },
  archived: { label: 'Archived', variant: 'secondary', color: '#7A7A7A' },
};

export function SearchResults({
  results,
  isLoading,
  onDecisionClick,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!results || results.decisions.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.total} result{results.total !== 1 ? 's' : ''}
          {results.cacheHit && (
            <Badge variant="outline" className="ml-2 rounded-full">
              Cached
            </Badge>
          )}
        </p>
        {results.responseTimeMs && (
          <p className="text-xs text-muted-foreground">
            {results.responseTimeMs}ms
          </p>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.decisions.map((decision) => (
          <Card
            key={decision.id}
            className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            onClick={() => onDecisionClick?.(decision.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {decision.title}
                </CardTitle>
                <Badge
                  variant={statusConfig[decision.status]?.variant || 'outline'}
                  className="ml-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: statusConfig[decision.status]?.color
                      ? `${statusConfig[decision.status].color}20`
                      : undefined,
                    color: statusConfig[decision.status]?.color || undefined,
                    borderColor: statusConfig[decision.status]?.color || undefined,
                  }}
                >
                  {statusConfig[decision.status]?.label || decision.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {decision.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {decision.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {decision.area && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Area:</span>
                    <span>{decision.area}</span>
                  </div>
                )}
                {decision.required_by && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(decision.required_by), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
