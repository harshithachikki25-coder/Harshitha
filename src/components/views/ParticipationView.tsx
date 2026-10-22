import React from 'react';
import { Users, Gauge, MapPin, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
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
  aggregateParticipationOverTime,
  aggregateCapacityUtilizationByCategory,
} from '../../utils/dataProcessor';

interface ParticipationViewProps {
  records: StandardEventRecord[];
  hasCapacityData: boolean;
}

export const ParticipationView: React.FC<ParticipationViewProps> = ({
  records,
  hasCapacityData,
}) => {
  const participationOverTime = aggregateParticipationOverTime(records);
  const utilizationByCategory = aggregateCapacityUtilizationByCategory(records);

  // Top 10 events by capacity utilization (overbooked vs optimal)
  const topUtilizedEvents = [...records]
    .filter((r) => r.capacity > 0)
    .sort((a, b) => b.capacityUtilization - a.capacityUtilization)
    .slice(0, 10)
    .map((e) => ({
      name: e.eventName.length > 20 ? e.eventName.substring(0, 18) + '...' : e.eventName,
      fullName: e.eventName,
      utilization: e.capacityUtilization,
      participants: e.participants,
      capacity: e.capacity,
      department: e.department,
    }));

  // Venue aggregation
  const venueMap: Record<
    string,
    { venue: string; totalTurnout: number; totalCapacity: number; count: number }
  > = {};
  records.forEach((r) => {
    if (!venueMap[r.venue]) {
      venueMap[r.venue] = { venue: r.venue, totalTurnout: 0, totalCapacity: 0, count: 0 };
    }
    venueMap[r.venue].totalTurnout += r.participants;
    if (r.capacity > 0) venueMap[r.venue].totalCapacity += r.capacity;
    venueMap[r.venue].count += 1;
  });

  const venueStats = Object.values(venueMap)
    .map((v) => ({
      ...v,
      avgTurnout: Math.round(v.totalTurnout / v.count),
      utilizationPercent:
        v.totalCapacity > 0 ? Number(((v.totalTurnout / v.totalCapacity) * 100).toFixed(1)) : null,
    }))
    .sort((a, b) => b.totalTurnout - a.totalTurnout);

  // Utilization breakdown buckets
  const withCap = records.filter((r) => r.capacity > 0);
  const overCapCount = withCap.filter((r) => r.capacityUtilization > 100).length;
  const optimalCount = withCap.filter((r) => r.capacityUtilization >= 75 && r.capacityUtilization <= 100).length;
  const moderateCount = withCap.filter((r) => r.capacityUtilization >= 50 && r.capacityUtilization < 75).length;
  const lowCount = withCap.filter((r) => r.capacityUtilization < 50).length;

  return (
    <div className="space-y-6">
      {/* Capacity Utilization Distribution Tiers */}
      {hasCapacityData && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Capacity Utilization Distribution & Sizing Health
                </h3>
                <p className="text-xs text-slate-500">
                  Formula: (Participants / Capacity) × 100
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {withCap.length.toLocaleString()} events with capacity
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">
                Over-Capacity (&gt;100%)
              </span>
              <div className="text-xl font-bold font-mono text-rose-900 mt-1">
                {overCapCount}
              </div>
              <span className="text-[11px] text-rose-600 block mt-0.5">
                {withCap.length > 0 ? ((overCapCount / withCap.length) * 100).toFixed(1) : 0}% of events overbooked
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                Optimal Sizing (75–100%)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                {optimalCount}
              </div>
              <span className="text-[11px] text-emerald-600 block mt-0.5">
                {withCap.length > 0 ? ((optimalCount / withCap.length) * 100).toFixed(1) : 0}% optimal utilization
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                Moderate (50–74%)
              </span>
              <div className="text-xl font-bold font-mono text-blue-900 mt-1">
                {moderateCount}
              </div>
              <span className="text-[11px] text-blue-600 block mt-0.5">
                {withCap.length > 0 ? ((moderateCount / withCap.length) * 100).toFixed(1) : 0}% moderate turnout
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                Under-Utilized (&lt;50%)
              </span>
              <div className="text-xl font-bold font-mono text-amber-900 mt-1">
                {lowCount}
              </div>
              <span className="text-[11px] text-amber-600 block mt-0.5">
                {withCap.length > 0 ? ((lowCount / withCap.length) * 100).toFixed(1) : 0}% room oversized
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Graph 3 (Participation Trend) & Graph 9 (Utilization by Event) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 3: Event participation over time */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Event Participation Over Time
              </h3>
              <p className="text-xs text-slate-500">
                Monthly student participation timeline and attendance volume
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
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Students`, 'Turnout']}
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
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  name="Total Turnout"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 9: Capacity utilization by event bar chart */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                9. Capacity Utilization by Event (Top 10)
              </h3>
              <p className="text-xs text-slate-500">
                Highest percentage capacity utilization across recorded events
              </p>
            </div>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>

          {hasCapacityData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topUtilizedEvents}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    unit="%"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-800 space-y-1">
                            <div className="font-bold text-slate-100">{d.fullName}</div>
                            <div className="text-slate-300">Dept: {d.department}</div>
                            <div className="text-emerald-300 font-mono font-bold">
                              Utilization: {d.utilization}%
                            </div>
                            <div className="text-slate-400 font-mono">
                              Turnout: {d.participants} / {d.capacity} seats
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="utilization"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    name="Utilization %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              Capacity data not available in uploaded dataset.
            </div>
          )}
        </div>
      </div>

      {/* Venue Performance and Capacity Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Venue Utilization & Space Efficiency Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Total event hosting counts, average student crowds, and venue capacity rates
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {venueStats.length} Venues
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-3.5 py-2.5">Venue Name</th>
                <th className="px-3.5 py-2.5 text-right">Events Hosted</th>
                <th className="px-3.5 py-2.5 text-right">Total Turnout</th>
                <th className="px-3.5 py-2.5 text-right">Avg Turnout / Event</th>
                <th className="px-3.5 py-2.5 text-right">Capacity Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {venueStats.map((v) => (
                <tr key={v.venue} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2.5 font-medium text-slate-900">
                    {v.venue}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                    {v.count}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                    {v.totalTurnout.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                    {v.avgTurnout.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-medium text-emerald-600">
                    {v.utilizationPercent !== null ? `${v.utilizationPercent}%` : '—'}
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
