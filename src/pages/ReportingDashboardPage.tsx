import { useState } from 'react';
import { EnhancedNavbar } from '@/components/dashboard/EnhancedNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportFilterDialog } from '@/components/reports/ReportFilterDialog';
import { ExportStatusCard } from '@/components/exports/ExportStatusCard';
import {
  useGenerateAggregateCountsReport,
  useGenerateOverdueDecisionsReport,
  useGenerateTimeToDecisionReport,
  useReports,
} from '@/hooks/useReports';
import { useExports } from '@/hooks/useExports';
import {
  BarChart3,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Filter,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { ReportFilters } from '@/api/reports';
import type { AggregateCountsData, OverdueDecisionsData, TimeToDecisionData } from '@/api/reports';

export default function ReportingDashboardPage() {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [activeTab, setActiveTab] = useState<'metrics' | 'reports' | 'exports'>('metrics');

  const generateAggregateCounts = useGenerateAggregateCountsReport();
  const generateOverdueDecisions = useGenerateOverdueDecisionsReport();
  const generateTimeToDecision = useGenerateTimeToDecisionReport();
  const { data: reports = [] } = useReports({ limit: 10 });
  const { data: exports = [], isLoading: exportsLoading } = useExports({ limit: 10 });

  const handleGenerateReport = (type: 'aggregate' | 'overdue' | 'time') => {
    const mutation =
      type === 'aggregate'
        ? generateAggregateCounts
        : type === 'overdue'
        ? generateOverdueDecisions
        : generateTimeToDecision;

    mutation.mutate(filters);
  };

  const latestAggregateReport = reports.find((r) => r.metric_type === 'aggregate_counts');
  const latestOverdueReport = reports.find((r) => r.metric_type === 'overdue_decisions');
  const latestTimeReport = reports.find((r) => r.metric_type === 'time_to_decision');

  const aggregateData = latestAggregateReport?.data as AggregateCountsData | undefined;
  const overdueData = latestOverdueReport?.data as OverdueDecisionsData | undefined;
  const timeData = latestTimeReport?.data as TimeToDecisionData | undefined;

  // Prepare chart data
  const statusChartData = aggregateData?.byStatus
    ? Object.entries(aggregateData.byStatus).map(([status, count]) => ({
        status: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }))
    : [];

  const trendChartData = timeData?.trend || [];

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <EnhancedNavbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Reporting & Analytics</h1>
          <p className="text-[#7A7A7A]">View metrics, generate reports, and manage exports</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6 rounded-full bg-white shadow-sm">
            <TabsTrigger value="metrics" className="rounded-full">
              <BarChart3 className="mr-2 h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="exports" className="rounded-full">
              <Download className="mr-2 h-4 w-4" />
              Exports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Key Metrics</h2>
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(true)}
                className="rounded-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-[#F6FDF6] border-[#5FD37B]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#5FD37B]" />
                    Total Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1A1A1A]">
                    {aggregateData?.total || 0}
                  </div>
                  <p className="text-sm text-[#7A7A7A] mt-2">
                    {aggregateData?.recent || 0} created in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-[#FFFBE6] border-[#F6C96B]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#F6C96B]" />
                    Overdue Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1A1A1A]">
                    {overdueData?.count || 0}
                  </div>
                  <p className="text-sm text-[#7A7A7A] mt-2">
                    Requiring immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-[#F4F0FF] border-[#9D79F9]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#9D79F9]" />
                    Avg. Time to Decision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1A1A1A]">
                    {timeData?.average ? `${timeData.average.toFixed(1)}` : '0'} days
                  </div>
                  <p className="text-sm text-[#7A7A7A] mt-2">
                    Median: {timeData?.median ? `${timeData.median.toFixed(1)}` : '0'} days
                  </p>
                </CardContent>
              </Card>
            </div>

            {statusChartData.length > 0 && (
              <Card className="rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A]">
                    Decisions by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="status" stroke="#7A7A7A" />
                      <YAxis stroke="#7A7A7A" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#9D79F9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {trendChartData.length > 0 && (
              <Card className="rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Time to Decision Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="period" stroke="#7A7A7A" />
                      <YAxis stroke="#7A7A7A" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#9D79F9"
                        strokeWidth={2}
                        dot={{ fill: '#9D79F9', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Generate Reports</h2>
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(true)}
                className="rounded-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#9D79F9]" />
                    Aggregate Counts
                  </CardTitle>
                  <CardDescription className="text-[#7A7A7A]">
                    Overview of decision counts by status and project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleGenerateReport('aggregate')}
                    disabled={generateAggregateCounts.isPending}
                    className="w-full rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white hover:scale-105 transition-transform"
                  >
                    {generateAggregateCounts.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#F6C96B]" />
                    Overdue Decisions
                  </CardTitle>
                  <CardDescription className="text-[#7A7A7A]">
                    List of decisions past their required-by date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleGenerateReport('overdue')}
                    disabled={generateOverdueDecisions.isPending}
                    className="w-full rounded-full bg-[#F6C96B] hover:bg-[#E5B85A] text-white hover:scale-105 transition-transform"
                  >
                    {generateOverdueDecisions.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#6AD8FA]" />
                    Time to Decision
                  </CardTitle>
                  <CardDescription className="text-[#7A7A7A]">
                    Average time from creation to decision
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleGenerateReport('time')}
                    disabled={generateTimeToDecision.isPending}
                    className="w-full rounded-full bg-[#6AD8FA] hover:bg-[#59C7E9] text-white hover:scale-105 transition-transform"
                  >
                    {generateTimeToDecision.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {reports.length > 0 && (
              <Card className="rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1A1A1A]">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] hover:bg-[#F0F8FF] transition-colors"
                      >
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{report.report_name}</p>
                          <p className="text-sm text-[#7A7A7A]">
                            {new Date(report.generated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-[#F4F0FF] text-[#9D79F9] border-[#9D79F9] rounded-full">
                          {report.metric_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Export History</h2>
            </div>

            {exportsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#9D79F9]" />
              </div>
            ) : exports.length === 0 ? (
              <Card className="rounded-2xl shadow-md">
                <CardContent className="py-12 text-center">
                  <Download className="h-12 w-12 text-[#7A7A7A] mx-auto mb-4" />
                  <p className="text-[#7A7A7A]">No exports yet</p>
                  <p className="text-sm text-[#7A7A7A] mt-2">
                    Export a decision or project to see it here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exports.map((export_) => (
                  <ExportStatusCard key={export_.id} export_={export_} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ReportFilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          onApplyFilters={setFilters}
          initialFilters={filters}
        />
      </div>
    </div>
  );
}
