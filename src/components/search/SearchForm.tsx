import { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SearchFilters } from '@/api/search';

interface SearchFormProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  showFilters?: boolean;
  className?: string;
}

export function SearchForm({
  onSearch,
  initialQuery = '',
  initialFilters,
  showFilters = true,
  className,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (query.trim() || Object.keys(filters).length > 0) {
        onSearch(query, filters);
      }
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters]);

  const handleClear = useCallback(() => {
    setQuery('');
    setFilters({});
    onSearch('', {});
  }, [onSearch]);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search decisions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-full"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Select
                value={filters.status || ''}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value as SearchFilters['status'] || undefined,
                  }))
                }
              >
                <SelectTrigger className="w-[140px] h-9 rounded-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="waiting_for_client">Waiting for Client</SelectItem>
                  <SelectItem value="decided">Decided</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    onSearch(query, {});
                  }}
                  className="h-9 rounded-full"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              )}

              {/* Active Filter Badges */}
              {filters.status && (
                <Badge variant="secondary" className="rounded-full">
                  Status: {filters.status}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
