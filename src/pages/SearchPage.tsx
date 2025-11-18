import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedNavbar } from '@/components/dashboard/EnhancedNavbar';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import type { SearchFilters } from '@/api/search';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchParams, setSearchParams] = useState<{ query: string; filters?: SearchFilters } | null>(null);

  const { data: results, isLoading } = useSearch(searchParams);

  const handleSearch = (searchQuery: string, searchFilters?: SearchFilters) => {
    setQuery(searchQuery);
    setFilters(searchFilters || {});
    if (searchQuery.trim() || Object.keys(searchFilters || {}).length > 0) {
      setSearchParams({ query: searchQuery, filters: searchFilters });
    } else {
      setSearchParams(null);
    }
  };

  const handleDecisionClick = (decisionId: string) => {
    navigate(`/decisions/${decisionId}`);
  };

  const handleNewDecision = () => {
    navigate('/decisions/new');
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavbar
        onSearch={(q) => {
          setQuery(q);
          handleSearch(q, filters);
        }}
        onNewDecision={handleNewDecision}
      />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Search Decisions</h1>
          <p className="text-muted-foreground">
            Find decisions quickly with intelligent search and filtering
          </p>
        </div>

        <div className="space-y-6">
          <SearchForm
            onSearch={handleSearch}
            initialQuery={query}
            initialFilters={filters}
            showFilters={true}
          />

          <SearchResults
            results={results || null}
            isLoading={isLoading}
            onDecisionClick={handleDecisionClick}
          />
        </div>
      </div>
    </div>
  );
}
