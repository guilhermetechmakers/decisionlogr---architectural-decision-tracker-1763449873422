import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { Decision } from './decisions';

export type SearchQuery = Database['public']['Tables']['search_queries']['Row'];
export type SearchQueryInsert = Database['public']['Tables']['search_queries']['Insert'];
export type CachedResult = Database['public']['Tables']['cached_results']['Row'];
export type CachedResultInsert = Database['public']['Tables']['cached_results']['Insert'];

export interface SearchFilters {
  status?: Decision['status'];
  projectId?: string;
  assigneeId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchParams {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  decisions: Decision[];
  total: number;
  cacheHit: boolean;
  responseTimeMs: number;
}

/**
 * Generate a cache key from search parameters
 */
function generateCacheKey(params: SearchParams): string {
  const key = JSON.stringify({
    query: params.query.toLowerCase().trim(),
    filters: params.filters || {},
    limit: params.limit || 10,
    offset: params.offset || 0,
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `search_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if a cached result exists and is still valid
 */
async function getCachedResult(cacheKey: string): Promise<CachedResult | null> {
  const { data, error } = await supabase
    .from('cached_results')
    .select('*')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching cached result:', error);
    return null;
  }

  return data;
}

/**
 * Update cache hit count
 */
async function incrementCacheHit(cacheId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_cache_hit', { cache_id: cacheId });
    if (error) throw error;
  } catch {
    // Fallback if RPC doesn't exist
    const { data } = await supabase
      .from('cached_results')
      .select('hit_count')
      .eq('id', cacheId)
      .single();
    
    if (data) {
      await supabase
        .from('cached_results')
        .update({ hit_count: (data.hit_count || 0) + 1 })
        .eq('id', cacheId);
    }
  }
}

/**
 * Store a cached result
 */
async function storeCachedResult(
  cacheKey: string,
  resultData: SearchResult,
  searchQueryId?: string,
  ttlMinutes: number = 30
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

  const { error } = await supabase
    .from('cached_results')
    .upsert({
      cache_key: cacheKey,
      search_query_id: searchQueryId || null,
      result_data: resultData,
      expires_at: expiresAt.toISOString(),
      hit_count: 0,
    }, {
      onConflict: 'cache_key',
    });

  if (error) {
    console.error('Error storing cached result:', error);
  }
}

/**
 * Perform a search query with caching
 */
export async function searchDecisions(params: SearchParams): Promise<SearchResult> {
  const startTime = performance.now();
  const cacheKey = generateCacheKey(params);
  
  // Check cache first
  const cached = await getCachedResult(cacheKey);
  if (cached) {
    // Increment hit count
    await incrementCacheHit(cached.id);
    
    const responseTime = Math.round(performance.now() - startTime);
    
    // Log search query with cache hit
    await logSearchQuery(params, (cached.result_data as SearchResult).decisions.length, responseTime, true);
    
    return {
      ...(cached.result_data as SearchResult),
      cacheHit: true,
      responseTimeMs: responseTime,
    };
  }

  // Perform actual search
  let query = supabase
    .from('decisions')
    .select('*', { count: 'exact' })
    .eq('archived', false);

  // Apply text search
  if (params.query.trim()) {
    query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,area.ilike.%${params.query}%`);
  }

  // Apply filters
  if (params.filters?.status) {
    query = query.eq('status', params.filters.status);
  }

  if (params.filters?.projectId) {
    query = query.eq('project_id', params.filters.projectId);
  }

  if (params.filters?.assigneeId) {
    query = query.eq('assignee_id', params.filters.assigneeId);
  }

  if (params.filters?.dateRange) {
    query = query
      .gte('required_by', params.filters.dateRange.start)
      .lte('required_by', params.filters.dateRange.end);
  }

  // Apply pagination
  const limit = params.limit || 10;
  const offset = params.offset || 0;
  query = query
    .order('required_by', { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  const responseTime = Math.round(performance.now() - startTime);
  const decisions = (data || []) as Decision[];
  const total = count || 0;

  const result: SearchResult = {
    decisions,
    total,
    cacheHit: false,
    responseTimeMs: responseTime,
  };

  // Log search query
  const searchQueryId = await logSearchQuery(params, total, responseTime, false);

  // Store in cache
  await storeCachedResult(cacheKey, result, searchQueryId || undefined);

  return result;
}

/**
 * Log a search query
 */
async function logSearchQuery(
  params: SearchParams,
  resultCount: number,
  responseTimeMs: number,
  cacheHit: boolean
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('search_queries')
    .insert({
      user_id: user?.id || null,
      query_text: params.query,
      filters: params.filters || {},
      result_count: resultCount,
      response_time_ms: responseTimeMs,
      cache_hit: cacheHit,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging search query:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Get recent search queries for a user
 */
export async function getRecentSearchQueries(limit: number = 10): Promise<SearchQuery[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('search_queries')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Clear cache for a specific query or all cache
 */
export async function clearCache(cacheKey?: string): Promise<void> {
  if (cacheKey) {
    const { error } = await supabase
      .from('cached_results')
      .delete()
      .eq('cache_key', cacheKey);

    if (error) throw error;
  } else {
    // Clear all expired cache entries
    const { error } = await supabase
      .from('cached_results')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
  totalHits: number;
  averageHitCount: number;
}> {
  const { data: allCache, error: allError } = await supabase
    .from('cached_results')
    .select('hit_count, expires_at');

  if (allError) throw allError;

  const now = new Date();
  const activeEntries = (allCache || []).filter(
    entry => new Date(entry.expires_at) > now
  );
  const expiredEntries = (allCache || []).length - activeEntries.length;
  const totalHits = (allCache || []).reduce((sum, entry) => sum + (entry.hit_count || 0), 0);
  const averageHitCount = (allCache || []).length > 0
    ? totalHits / (allCache || []).length
    : 0;

  return {
    totalEntries: (allCache || []).length,
    activeEntries: activeEntries.length,
    expiredEntries,
    totalHits,
    averageHitCount: Math.round(averageHitCount * 100) / 100,
  };
}
