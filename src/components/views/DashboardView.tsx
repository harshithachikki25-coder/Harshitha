import React from 'react';
import {
  CalendarDays,
  Users,
  Star,
  Gauge,
  Wallet,
  Building2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { StandardEventRecord, SummaryMetrics, InsightItem } from '../../types';
import { MetricCard } from '../common/MetricCard';
import {
  aggregateEventsByCategory,
  aggregateParticipantsByDepartment,
  aggregateParticipationOverTime,
  aggregateCategoryDistribution,
  getTopEventsByParticipants,
  getLowAttendanceEvents,
} from '../../utils/dataProcessor';

interface DashboardViewProps {
  records: StandardEventRecord[];
  metrics: SummaryMetrics;
  insights: InsightItem[];
  onNavigateTab: (tab: any) => void;
}

const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  metrics,
  insights,
  onNavigateTab,
}) => {
  const eventsByCategory = aggregateEventsByCategory(records);
  const participantsByDept = aggregateParticipantsByDepartment(records);
  const participationOverTime = aggregateParticipationOverTime(records);
  const categoryDistribution = aggregateCategoryDistribution(records);
  const topEvents = getTopEventsByParticipants(records, 5);
  const lowAttendanceEvents = getLowAttendanceEvents(records, 5);

  return (
    <div className="space-y-6">
      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <MetricCard
          title="Total Events"
          value={metrics.totalEvents.toLocaleString()}
          subtitle="Events recorded"
          icon={CalendarDays}
          accentColor="indigo"
        />
        <MetricCard
          title="Total Participants"
          value={metrics.totalParticipants.toLocaleString()}
          subtitle={`${metrics.averageParticipantsPerEvent ?? 0} avg per event`}
          icon={Users}
          accentColor="blue"
        />
        <MetricCard
          title="Average Rating"
          value={metrics.averageRating !== null ? `${metrics.averageRating} / 5.0` : null}
          subtitle="Student satisfaction"
          icon={Star}
          isAvailable={metrics.hasRatingData}
          accentColor="amber"
        />
        <MetricCard
          title="Avg Utilization"
          value={
            metrics.averageCapacityUtilization !== null
              ? `${metrics.averageCapacityUtilization}%`
              : null
          }
          subtitle="Capacity efficiency"
          icon={Gauge}
          isAvailable={metrics.hasCapacityData}
          accentColor="emerald"
        />
        <MetricCard
          title="Total Budget"
          value={
            metrics.totalBudget !== null
              ? `$${(metrics.totalBudget / 1000).toFixed(1)}k`
              : null
          }
          subtitle={
            metrics.averageBudgetPerEvent !== null
              ? `$${metrics.averageBudgetPerEvent.toLocaleString()} avg / event`
              : undefined
          }
          icon={Wallet}
          isAvailable={metrics.hasBudgetData}
          accentColor="purple"
        />
        <MetricCard
          title="Departments"
          value={metrics.departmentCount}
          subtitle="Academic units"
          icon={Building2}
          accentColor="emerald"
        />
      </div>

      {/* Automated Key Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Computed Dataset Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.map((item) => {
              const borderStyles = {
                highlight: 'border-indigo-100 bg-indigo-50/40 text-indigo-900',
                warning: 'border-amber-100 bg-amber-50/40 text-amber-900',
                trend: 'border-emerald-100 bg-emerald-50/40 text-emerald-900',
                recommendation: 'border-purple-100 bg-purple-50/40 text-purple-900',
              }[item.category];

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border ${borderStyles} flex flex-col justify-between`}
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {item.title}
                    </span>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {item.metricValue && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs font-mono font-bold text-slate-900">
                      {item.metricValue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bar chart: Number of events by category */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Events by Category
              </h3>
              <p className="text-xs text-slate-500">
                Total event count distributed across distinct campus categories
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {eventsByCategory.length} categories
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eventsByCategory}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0)} Events`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar chart: Total participants by department */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Total Participants by Department
              </h3>
              <p className="text-xs text-slate-500">
                Aggregated student turnout across academic branches
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('department-analytics')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Drill down</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={participantsByDept}
                margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="department"
                  stroke="#64748b"
                  fontSize={10}
                  angle={-30}
                  textAnchor="end"
                  tickLine={false}
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Students`, 'Attendance']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="participants"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  name="Turnout"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Line chart: Event participation over time */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Participation Trend Over Time
              </h3>
              <p className="text-xs text-slate-500">
                Monthly student turnout progression across academic calendar
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={participationOverTime}
                margin={{ top: 10, right: 15, left: -5, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Participants`, 'Turnout']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="participants"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                  name="Monthly Attendees"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Pie chart: Distribution of events by category */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                4. Event Category Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Proportional share of organized events by category
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total {records.length}
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0)} Events`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Previews: Top 5 Popular Events & Low Attendance Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Events */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Top 5 Most Popular Events
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('event-analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All Top 10</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topEvents.map((evt, idx) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center text-xs font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {evt.eventName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{evt.department}</span>
                      <span>·</span>
                      <span>{evt.category}</span>
                      <span>·</span>
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-slate-900">
                    {evt.participants.toLocaleString()} attendees
                  </div>
                  {evt.capacity > 0 && (
                    <div className="text-[11px] font-mono text-emerald-600">
                      {evt.capacityUtilization}% capacity
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Notice */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Low Attendance Monitor
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Under-utilized sessions
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {lowAttendanceEvents.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {evt.eventName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{evt.department}</span>
                    <span>·</span>
                    <span>{evt.eventDate}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-slate-700">
                    {evt.participants} / {evt.capacity > 0 ? evt.capacity : 'N/A'}
                  </div>
                  <div className="text-[11px] font-mono font-medium text-amber-600">
                    {evt.capacity > 0 ? `${evt.capacityUtilization}% utilized` : 'Low turnout'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
