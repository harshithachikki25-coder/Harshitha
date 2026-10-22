import React, { useState } from 'react';
import {
  Trophy,
  AlertTriangle,
  ScatterChart as ScatterIcon,
  Search,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { StandardEventRecord } from '../../types';
import {
  getTopEventsByParticipants,
  getLowAttendanceEvents,
  getCapacityVsParticipantsData,
} from '../../utils/dataProcessor';

interface EventAnalyticsViewProps {
  records: StandardEventRecord[];
  hasCapacityData: boolean;
}

export const EventAnalyticsView: React.FC<EventAnalyticsViewProps> = ({
  records,
  hasCapacityData,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<StandardEventRecord | null>(null);
  const top10Events = getTopEventsByParticipants(records, 10);
  const lowAttendanceEvents = getLowAttendanceEvents(records, 10);
  const scatterData = getCapacityVsParticipantsData(records, 150);

  // Formatted top 10 for bar chart
  const top10ChartData = top10Events.map((e) => ({
    name: e.eventName.length > 20 ? e.eventName.substring(0, 18) + '...' : e.eventName,
    fullName: e.eventName,
    participants: e.participants,
    department: e.department,
    capacity: e.capacity,
    rating: e.rating,
  }));

  return (
    <div className="space-y-6">
      {/* Top 10 Events Bar Chart (Graph 5) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                5. Top 10 Most Popular Events by Participants
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by verified student attendee turnout
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {records.length.toLocaleString()} total events analyzed
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top10ChartData}
              layout="vertical"
              margin={{ top: 10, right: 25, left: 50, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                width={120}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-100">{data.fullName}</div>
                        <div className="text-slate-300">Dept: {data.department}</div>
                        <div className="text-indigo-300 font-mono">
                          Turnout: {data.participants.toLocaleString()} students
                        </div>
                        {data.capacity > 0 && (
                          <div className="text-slate-400 font-mono">
                            Venue Capacity: {data.capacity}
                          </div>
                        )}
                        {data.rating > 0 && (
                          <div className="text-amber-300 font-mono">
                            Rating: {data.rating} / 5.0 ★
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="participants" fill="#6366f1" radius={[0, 4, 4, 0]} name="Participants" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graph 6: Scatter Plot: Capacity vs Participants */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ScatterIcon className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                6. Scatter Plot: Event Capacity vs. Actual Participants
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating room sizing accuracy; dashed line indicates 100% capacity balance
              </p>
            </div>
          </div>
          {hasCapacityData ? (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Event Data Point
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500" />
                100% Capacity Target
              </span>
            </div>
          ) : (
            <span className="text-xs text-amber-600 italic">
              Capacity column unavailable in dataset
            </span>
          )}
        </div>

        {hasCapacityData ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="capacity"
                  name="Capacity"
                  unit=" seats"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="participants"
                  name="Participants"
                  unit=" students"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <ZAxis range={[50, 50]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const isOver = d.utilization > 100;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-800 space-y-1">
                          <div className="font-bold text-slate-100">{d.name}</div>
                          <div className="text-slate-300">Dept: {d.department}</div>
                          <div className="text-slate-300">Category: {d.category}</div>
                          <div className="font-mono text-indigo-300">
                            Participants: {d.participants}
                          </div>
                          <div className="font-mono text-slate-400">
                            Room Capacity: {d.capacity}
                          </div>
                          <div
                            className={`font-mono font-bold ${
                              isOver ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            Utilization: {d.utilization}% ({isOver ? 'Over capacity' : 'Within capacity'})
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* 45-degree reference line representing 100% capacity */}
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1000, y: 1000 },
                  ]}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Scatter
                  name="Events"
                  data={scatterData}
                  fill="#6366f1"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
            No capacity column mapped. Map the capacity column to render the scatter plot.
          </div>
        )}
      </div>

      {/* Tables Grid: Top 10 Table & Low Attendance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Table */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Top 10 High-Attendance Events
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">By Attendance</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Event Name</th>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5 text-right">Turnout</th>
                  <th className="px-3 py-2.5 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10Events.map((evt, idx) => (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[150px]">
                      {evt.eventName}
                    </td>
                    <td className="px-3 py-2 text-slate-500 truncate max-w-[110px]">
                      {evt.department}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                      {evt.participants.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-amber-600">
                      {evt.rating > 0 ? `${evt.rating} ★` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Attendance Table */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Low Attendance Review (&lt;50% Capacity)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Requires Attention</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-3 py-2.5">Event Name</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5 text-right">Turnout / Cap</th>
                  <th className="px-3 py-2.5 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowAttendanceEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[150px]">
                      {evt.eventName}
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {evt.category}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700">
                      {evt.participants} / {evt.capacity > 0 ? evt.capacity : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium text-amber-600">
                      {evt.capacity > 0 ? `${evt.capacityUtilization}%` : 'Low'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Event Details Drawer/Modal on click */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                  {selectedEvent.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedEvent.eventName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-900">{selectedEvent.department}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-900">{selectedEvent.category}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Venue</span>
                <span className="font-semibold text-slate-900">{selectedEvent.venue}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Date</span>
                <span className="font-semibold text-slate-900 font-mono">{selectedEvent.eventDate}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Participants</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedEvent.participants.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Venue Capacity</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedEvent.capacity > 0 ? selectedEvent.capacity : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Capacity Utilization</span>
                <span className="font-semibold text-indigo-600 font-mono">
                  {selectedEvent.capacity > 0 ? `${selectedEvent.capacityUtilization}%` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Budget Allocated</span>
                <span className="font-semibold text-emerald-600 font-mono">
                  {selectedEvent.budget > 0 ? `$${selectedEvent.budget.toLocaleString()}` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
