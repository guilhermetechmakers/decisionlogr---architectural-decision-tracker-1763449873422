import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export interface ReportFilters {
  projectId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  assigneeId?: string;
}

export interface AggregateCountsData {
  total: number;
  byStatus: Record<string, number>;
  byProject: Record<string, number>;
  recent: number; // Last 30 days
}

export interface OverdueDecisionsData {
  count: number;
  decisions: Array<{
    id: string;
    title: string;
    project_id: string;
    project_name: string;
    required_by: string;
    days_overdue: number;
    assignee_name: string | null;
  }>;
}

export interface TimeToDecisionData {
  average: number; // in days
  median: number;
  min: number;
  max: number;
  byProject: Record<string, number>;
  trend: Array<{
    period: string;
    average: number;
  }>;
}

export type ReportData = AggregateCountsData | OverdueDecisionsData | TimeToDecisionData;

/**
 * Generate aggregate counts report
 */
export async function generateAggregateCountsReport(
  filters: ReportFilters = {}
): Promise<Report> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');

  let query = supabase
    .from('decisions')
    .select('id, status, project_id, created_at, archived')
    .eq('archived', false);

  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  const { data: decisions, error } = await query;

  if (error) throw error;

  // Calculate aggregates
  const total = decisions?.length || 0;
  const byStatus: Record<string, number> = {};
  const byProject: Record<string, number> = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  let recent = 0;

  decisions?.forEach((decision) => {
    // Count by status
    byStatus[decision.status] = (byStatus[decision.status] || 0) + 1;

    // Count by project
    byProject[decision.project_id] = (byProject[decision.project_id] || 0) + 1;

    // Count recent
    if (new Date(decision.created_at) >= thirtyDaysAgo) {
      recent++;
    }
  });

  // Get project names
  const projectIds = Object.keys(byProject);
  const projectNames: Record<string, string> = {};
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .in('id', projectIds);

    projects?.forEach((project) => {
      projectNames[project.id] = project.name;
    });
  }

  const data: AggregateCountsData = {
    total,
    byStatus,
    byProject: Object.fromEntries(
      Object.entries(byProject).map(([id, count]) => [projectNames[id] || id, count])
    ),
    recent,
  };

  // Save report
  const reportData: ReportInsert = {
    user_id: user.user.id,
    metric_type: 'aggregate_counts',
    report_name: 'Aggregate Counts Report',
    data,
    filters,
    generated_at: new Date().toISOString(),
  };

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert(reportData)
    .select()
    .single();

  if (reportError) throw reportError;
  if (!report) throw new Error('Failed to create report');

  return report;
}

/**
 * Generate overdue decisions report
 */
export async function generateOverdueDecisionsReport(
  filters: ReportFilters = {}
): Promise<Report> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('decisions')
    .select('id, title, project_id, required_by, assignee_id, status')
    .eq('archived', false)
    .lt('required_by', today)
    .neq('status', 'decided');

  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters.assigneeId) {
    query = query.eq('assignee_id', filters.assigneeId);
  }

  const { data: decisions, error } = await query;

  if (error) throw error;

  // Get project names and assignee names
  const projectIds = [...new Set(decisions?.map((d) => d.project_id) || [])];
  const assigneeIds = [...new Set(decisions?.map((d) => d.assignee_id).filter(Boolean) || [])];

  const [projectsResult, assigneesResult] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from('projects')
          .select('id, name')
          .in('id', projectIds)
      : Promise.resolve({ data: [] }),
    assigneeIds.length > 0
      ? supabase
          .from('user_profiles')
          .select('user_id, full_name')
          .in('user_id', assigneeIds)
      : Promise.resolve({ data: [] }),
  ]);

  const projectMap = new Map(
    (projectsResult.data || []).map((p) => [p.id, p.name])
  );
  const assigneeMap = new Map(
    (assigneesResult.data || []).map((a) => [a.user_id, a.full_name])
  );

  const overdueDecisions = (decisions || []).map((decision) => {
    const requiredBy = new Date(decision.required_by);
    const todayDate = new Date(today);
    const daysOverdue = Math.floor(
      (todayDate.getTime() - requiredBy.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: decision.id,
      title: decision.title,
      project_id: decision.project_id,
      project_name: projectMap.get(decision.project_id) || 'Unknown Project',
      required_by: decision.required_by,
      days_overdue: daysOverdue,
      assignee_name: decision.assignee_id ? assigneeMap.get(decision.assignee_id) || null : null,
    };
  });

  const data: OverdueDecisionsData = {
    count: overdueDecisions.length,
    decisions: overdueDecisions.sort((a, b) => b.days_overdue - a.days_overdue),
  };

  // Save report
  const reportData: ReportInsert = {
    user_id: user.user.id,
    metric_type: 'overdue_decisions',
    report_name: 'Overdue Decisions Report',
    data,
    filters,
    generated_at: new Date().toISOString(),
  };

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert(reportData)
    .select()
    .single();

  if (reportError) throw reportError;
  if (!report) throw new Error('Failed to create report');

  return report;
}

/**
 * Generate time-to-decision report
 */
export async function generateTimeToDecisionReport(
  filters: ReportFilters = {}
): Promise<Report> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');

  let query = supabase
    .from('decisions')
    .select('id, project_id, created_at, updated_at, status')
    .eq('archived', false)
    .eq('status', 'decided');

  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  const { data: decisions, error } = await query;

  if (error) throw error;

  // Calculate time to decision for each decision
  const times: number[] = [];
  const byProject: Record<string, number[]> = {};

  decisions?.forEach((decision) => {
    const created = new Date(decision.created_at);
    const updated = new Date(decision.updated_at);
    const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    times.push(days);
    if (!byProject[decision.project_id]) {
      byProject[decision.project_id] = [];
    }
    byProject[decision.project_id].push(days);
  });

  // Calculate statistics
  const sorted = [...times].sort((a, b) => a - b);
  const average = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const median =
    sorted.length > 0
      ? sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      : 0;
  const min = sorted.length > 0 ? sorted[0] : 0;
  const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;

  // Calculate averages by project
  const averagesByProject: Record<string, number> = {};
  Object.entries(byProject).forEach(([projectId, projectTimes]) => {
    averagesByProject[projectId] =
      projectTimes.length > 0
        ? projectTimes.reduce((a, b) => a + b, 0) / projectTimes.length
        : 0;
  });

  // Get project names
  const projectIds = Object.keys(averagesByProject);
  const projectNames: Record<string, string> = {};
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .in('id', projectIds);

    projects?.forEach((project) => {
      projectNames[project.id] = project.name;
    });
  }

  const byProjectWithNames: Record<string, number> = {};
  Object.entries(averagesByProject).forEach(([id, avg]) => {
    byProjectWithNames[projectNames[id] || id] = avg;
  });

  // Calculate trend (last 6 months)
  const trend: Array<{ period: string; average: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthDecisions = decisions?.filter((d) => {
      const created = new Date(d.created_at);
      return created >= monthStart && created <= monthEnd;
    }) || [];

    if (monthDecisions.length > 0) {
      const monthTimes = monthDecisions.map((d) => {
        const created = new Date(d.created_at);
        const updated = new Date(d.updated_at);
        return Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });
      const monthAvg =
        monthTimes.reduce((a, b) => a + b, 0) / monthTimes.length;
      trend.push({
        period: monthStart.toISOString().slice(0, 7), // YYYY-MM
        average: monthAvg,
      });
    }
  }

  const data: TimeToDecisionData = {
    average,
    median,
    min,
    max,
    byProject: byProjectWithNames,
    trend,
  };

  // Save report
  const reportData: ReportInsert = {
    user_id: user.user.id,
    metric_type: 'time_to_decision',
    report_name: 'Time to Decision Report',
    data,
    filters,
    generated_at: new Date().toISOString(),
  };

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert(reportData)
    .select()
    .single();

  if (reportError) throw reportError;
  if (!report) throw new Error('Failed to create report');

  return report;
}

/**
 * Get a single report
 */
export async function getReport(reportId: string): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Report not found');

  return data;
}

/**
 * List reports for the current user
 */
export async function listReports(params: {
  limit?: number;
  offset?: number;
  metricType?: Report['metric_type'];
} = {}): Promise<Report[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');

  let query = supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.user.id)
    .order('generated_at', { ascending: false });

  if (params.metricType) {
    query = query.eq('metric_type', params.metricType);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
}
