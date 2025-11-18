import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type SearchIndex = Database['public']['Tables']['search_indices']['Row'];
export type SearchIndexInsert = Database['public']['Tables']['search_indices']['Insert'];
export type SearchIndexUpdate = Database['public']['Tables']['search_indices']['Update'];

export interface PerformanceMetrics {
  averageResponseTime: number;
  cacheHitRate: number;
  totalQueries: number;
  queriesLast24h: number;
  slowQueries: number;
  topSearches: Array<{
    query: string;
    count: number;
    avgResponseTime: number;
  }>;
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get all search queries
  const { data: allQueries, error: queriesError } = await supabase
    .from('search_queries')
    .select('*')
    .order('created_at', { ascending: false });

  if (queriesError) throw queriesError;

  const queries = allQueries || [];
  const queriesLast24h = queries.filter(
    q => new Date(q.created_at) >= last24h
  );

  // Calculate metrics
  const totalQueries = queries.length;
  const cacheHits = queries.filter(q => q.cache_hit).length;
  const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
  
  const responseTimes = queries
    .filter(q => q.response_time_ms !== null)
    .map(q => q.response_time_ms!);
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;

  // Slow queries (over 3 seconds)
  const slowQueries = queries.filter(q => q.response_time_ms && q.response_time_ms > 3000).length;

  // Top searches
  const queryCounts = new Map<string, { count: number; totalTime: number }>();
  queries.forEach(q => {
    const key = q.query_text.toLowerCase().trim();
    const existing = queryCounts.get(key) || { count: 0, totalTime: 0 };
    queryCounts.set(key, {
      count: existing.count + 1,
      totalTime: existing.totalTime + (q.response_time_ms || 0),
    });
  });

  const topSearches = Array.from(queryCounts.entries())
    .map(([query, stats]) => ({
      query,
      count: stats.count,
      avgResponseTime: stats.totalTime / stats.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    averageResponseTime: Math.round(averageResponseTime),
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    totalQueries,
    queriesLast24h: queriesLast24h.length,
    slowQueries,
    topSearches,
  };
}

/**
 * Get all search indices
 */
export async function getSearchIndices(): Promise<SearchIndex[]> {
  const { data, error } = await supabase
    .from('search_indices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single search index
 */
export async function getSearchIndex(indexId: string): Promise<SearchIndex> {
  const { data, error } = await supabase
    .from('search_indices')
    .select('*')
    .eq('id', indexId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Search index not found');
  return data;
}

/**
 * Create a new search index metadata entry
 */
export async function createSearchIndex(index: SearchIndexInsert): Promise<SearchIndex> {
  const { data, error } = await supabase
    .from('search_indices')
    .insert(index)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create search index');
  return data;
}

/**
 * Update a search index metadata entry
 */
export async function updateSearchIndex(
  indexId: string,
  updates: SearchIndexUpdate
): Promise<SearchIndex> {
  const { data, error } = await supabase
    .from('search_indices')
    .update(updates)
    .eq('id', indexId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Search index not found');
  return data;
}

/**
 * Delete a search index metadata entry
 */
export async function deleteSearchIndex(indexId: string): Promise<void> {
  const { error } = await supabase
    .from('search_indices')
    .delete()
    .eq('id', indexId);

  if (error) throw error;
}

/**
 * Analyze and update index statistics
 */
export async function analyzeIndex(indexId: string): Promise<SearchIndex> {
  // This would typically call a database function to analyze the index
  // For now, we'll just update the last_analyzed timestamp
  const { data, error } = await supabase
    .from('search_indices')
    .update({
      last_analyzed: new Date().toISOString(),
    })
    .eq('id', indexId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Search index not found');
  return data;
}

/**
 * Get query performance over time
 */
export async function getQueryPerformanceOverTime(
  days: number = 7
): Promise<Array<{ date: string; count: number; avgResponseTime: number; cacheHitRate: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('search_queries')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  const queries = data || [];
  const dailyStats = new Map<string, { count: number; totalTime: number; cacheHits: number }>();

  queries.forEach(q => {
    const date = new Date(q.created_at).toISOString().split('T')[0];
    const existing = dailyStats.get(date) || { count: 0, totalTime: 0, cacheHits: 0 };
    dailyStats.set(date, {
      count: existing.count + 1,
      totalTime: existing.totalTime + (q.response_time_ms || 0),
      cacheHits: existing.cacheHits + (q.cache_hit ? 1 : 0),
    });
  });

  return Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      count: stats.count,
      avgResponseTime: stats.totalTime / stats.count,
      cacheHitRate: (stats.cacheHits / stats.count) * 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
