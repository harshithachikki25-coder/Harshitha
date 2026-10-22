import React from 'react';
import { Building2, DollarSign, Award, Users, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StandardEventRecord } from '../../types';
import {
  aggregateParticipantsByDepartment,
  aggregateBudgetByDepartment,
} from '../../utils/dataProcessor';

interface DepartmentAnalyticsViewProps {
  records: StandardEventRecord[];
  hasBudgetData: boolean;
}

export const DepartmentAnalyticsView: React.FC<DepartmentAnalyticsViewProps> = ({
  records,
  hasBudgetData,
}) => {
  const participantsByDept = aggregateParticipantsByDepartment(records);
  const budgetByDept = aggregateBudgetByDepartment(records);

  // Combine metrics for the comprehensive department matrix
  const deptMatrixMap: Record<
    string,
    {
      department: string;
      eventsCount: number;
      totalTurnout: number;
      totalBudget: number;
      ratingSum: number;
      ratingCount: number;
      capacitySum: number;
      capacityCount: number;
    }
  > = {};

  records.forEach((r) => {
    if (!deptMatrixMap[r.department]) {
      deptMatrixMap[r.department] = {
        department: r.department,
        eventsCount: 0,
        totalTurnout: 0,
        totalBudget: 0,
        ratingSum: 0,
        ratingCount: 0,
        capacitySum: 0,
        capacityCount: 0,
      };
    }
    const d = deptMatrixMap[r.department];
    d.eventsCount += 1;
    d.totalTurnout += r.participants;
    if (r.budget > 0) d.totalBudget += r.budget;
    if (r.rating > 0) {
      d.ratingSum += r.rating;
      d.ratingCount += 1;
    }
    if (r.capacity > 0) {
      d.capacitySum += r.capacityUtilization;
      d.capacityCount += 1;
    }
  });

  const departmentMatrix = Object.values(deptMatrixMap)
    .map((d) => ({
      ...d,
      avgRating: d.ratingCount > 0 ? Number((d.ratingSum / d.ratingCount).toFixed(2)) : null,
      avgUtilization: d.capacityCount > 0 ? Number((d.capacitySum / d.capacityCount).toFixed(1)) : null,
      avgBudgetPerEvent: d.eventsCount > 0 && d.totalBudget > 0 ? Math.round(d.totalBudget / d.eventsCount) : null,
      costPerAttendee: d.totalTurnout > 0 && d.totalBudget > 0 ? Number((d.totalBudget / d.totalTurnout).toFixed(1)) : null,
    }))
    .sort((a, b) => b.totalTurnout - a.totalTurnout);

  const topDepartment = departmentMatrix[0];

  return (
    <div className="space-y-6">
      {/* Top Department Highlight Banner */}
      {topDepartment && (
        <div className="bg-indigo-900 text-white rounded-xl p-5 border border-indigo-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-indigo-800 flex items-center justify-center text-indigo-300 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">
                Highest Participation Department
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {topDepartment.department}
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Organized {topDepartment.eventsCount} events with a total student turnout of{' '}
                {topDepartment.totalTurnout.toLocaleString()} attendees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-indigo-800 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>
              <div className="text-[11px] text-indigo-300">Avg Rating</div>
              <div className="text-base font-bold font-mono">
                {topDepartment.avgRating ? `${topDepartment.avgRating} ★` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-indigo-300">Avg Utilization</div>
              <div className="text-base font-bold font-mono">
                {topDepartment.avgUtilization ? `${topDepartment.avgUtilization}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Graph 2 (Turnout) & Graph 8 (Budget) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Total participants by department */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Student Turnout by Department
              </h3>
              <p className="text-xs text-slate-500">
                Aggregate headcount mobilized per academic branch
              </p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={participantsByDept}
                margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="department"
                  stroke="#64748b"
                  fontSize={10}
                  angle={-35}
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
                <Bar dataKey="participants" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Turnout" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Bar chart: Event budget by department */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                8. Event Budget by Department
              </h3>
              <p className="text-xs text-slate-500">
                Cumulative financial allocation across departments
              </p>
            </div>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>

          {hasBudgetData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetByDept}
                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="department"
                    stroke="#64748b"
                    fontSize={10}
                    angle={-35}
                    textAnchor="end"
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Budget']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="totalBudget"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    name="Total Budget"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              Budget data not detected in dataset. Map the budget column to render budget analysis.
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Comparative Department Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Department Performance Scorecard
            </h3>
            <p className="text-xs text-slate-500">
              Benchmarking events, total turnout, satisfaction rating, and capacity utilization
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {departmentMatrix.length} Departments
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-3.5 py-2.5">Department</th>
                <th className="px-3.5 py-2.5 text-right">Events Count</th>
                <th className="px-3.5 py-2.5 text-right">Total Turnout</th>
                <th className="px-3.5 py-2.5 text-right">Avg Rating</th>
                <th className="px-3.5 py-2.5 text-right">Avg Utilization</th>
                <th className="px-3.5 py-2.5 text-right">Total Budget</th>
                <th className="px-3.5 py-2.5 text-right">Cost / Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentMatrix.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2.5 font-medium text-slate-900">
                    {dept.department}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                    {dept.eventsCount}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                    {dept.totalTurnout.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-amber-600">
                    {dept.avgRating ? `${dept.avgRating} ★` : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-emerald-600 font-medium">
                    {dept.avgUtilization ? `${dept.avgUtilization}%` : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-purple-600">
                    {dept.totalBudget > 0 ? `$${dept.totalBudget.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-600">
                    {dept.costPerAttendee ? `$${dept.costPerAttendee}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
