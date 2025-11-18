import { TrendingUp, Clock, Zap, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMetrics } from '@/hooks/usePerformance';
import { Skeleton } from '@/components/ui/skeleton';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface PerformanceMetricsProps {
  className?: string;
}

export function PerformanceMetrics({ className }: PerformanceMetricsProps) {
  const { data: metrics, isLoading } = usePerformanceMetrics();

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No performance metrics available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics.topSearches.slice(0, 5).map((search) => ({
    query: search.query.length > 20 ? `${search.query.substring(0, 20)}...` : search.query,
    count: search.count,
    avgTime: Math.round(search.avgResponseTime),
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.averageResponseTime < 1000 ? 'Excellent' : metrics.averageResponseTime < 3000 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cacheHitRate > 50 ? 'Excellent' : metrics.cacheHitRate > 30 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.queriesLast24h} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Slow Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.slowQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Queries over 3s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Searches Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="query"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9D79F9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Searches List */}
      {metrics.topSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topSearches.slice(0, 10).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{search.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {search.count} searches • Avg {Math.round(search.avgResponseTime)}ms
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
