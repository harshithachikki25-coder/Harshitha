import React from 'react';
import { Star, MessageSquareQuote, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StandardEventRecord } from '../../types';
import {
  aggregateRatingByCategory,
  aggregateFeedbackByCategory,
} from '../../utils/dataProcessor';

interface FeedbackViewProps {
  records: StandardEventRecord[];
  hasRatingData: boolean;
  hasFeedbackData: boolean;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  records,
  hasRatingData,
  hasFeedbackData,
}) => {
  const ratingByCategory = aggregateRatingByCategory(records);
  const feedbackByCategory = aggregateFeedbackByCategory(records);

  // Compute rating distribution buckets (5 stars, 4 stars, 3 stars, 2 stars, 1 star)
  const ratingBuckets: Record<string, number> = {
    '4.5 – 5.0 (Excellent)': 0,
    '4.0 – 4.4 (Good)': 0,
    '3.5 – 3.9 (Average)': 0,
    '3.0 – 3.4 (Fair)': 0,
    '< 3.0 (Needs Improvement)': 0,
  };

  records.forEach((r) => {
    if (r.rating > 0) {
      if (r.rating >= 4.5) ratingBuckets['4.5 – 5.0 (Excellent)']++;
      else if (r.rating >= 4.0) ratingBuckets['4.0 – 4.4 (Good)']++;
      else if (r.rating >= 3.5) ratingBuckets['3.5 – 3.9 (Average)']++;
      else if (r.rating >= 3.0) ratingBuckets['3.0 – 3.4 (Fair)']++;
      else ratingBuckets['< 3.0 (Needs Improvement)']++;
    }
  });

  const ratingBucketData = Object.entries(ratingBuckets).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  // Highest rated events
  const highestRated = [...records]
    .filter((r) => r.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.participants - a.participants)
    .slice(0, 5);

  // Lowest rated events
  const lowestRated = [...records]
    .filter((r) => r.rating > 0)
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5);

  // Total feedback count
  const totalFeedbackCount = records.reduce((sum, r) => sum + r.feedbackCount, 0);

  return (
    <div className="space-y-6">
      {/* Feedback Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Feedback Responses
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {hasFeedbackData ? totalFeedbackCount.toLocaleString() : 'N/A'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">
            Collected survey responses from attendees
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Highest Rated Category
              </span>
              <div className="text-xl font-bold text-emerald-600 mt-1 truncate">
                {ratingByCategory.length > 0 ? ratingByCategory[0].category : 'N/A'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-2">
            {ratingByCategory.length > 0 ? `${ratingByCategory[0].averageRating} ★ average score` : 'No rating data'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Satisfaction Benchmark
              </span>
              <div className="text-xl font-bold text-indigo-600 mt-1">
                {records.length > 0
                  ? `${Math.round(
                      (records.filter((r) => r.rating >= 4.0).length / Math.max(1, records.filter((r) => r.rating > 0).length)) *
                        100
                    )}% Positive`
                  : 'N/A'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">
            Scored 4.0 or above satisfaction rating
          </span>
        </div>
      </div>

      {/* Grid: Graph 7 (Rating by Category) & Graph 10 (Feedback count by category) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 7: Bar chart: Average rating by event category */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                7. Average Rating by Event Category
              </h3>
              <p className="text-xs text-slate-500">
                Mean satisfaction score on a 1.0 to 5.0 scale
              </p>
            </div>
            <Star className="w-4 h-4 text-amber-500" />
          </div>

          {hasRatingData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingByCategory}
                  margin={{ top: 10, right: 10, left: -10, bottom: 35 }}
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
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 5]}
                    tickCount={6}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} / 5.0 ★`, 'Avg Rating']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="averageRating"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Average Rating"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              Rating column not present in dataset.
            </div>
          )}
        </div>

        {/* Graph 10: Feedback analysis chart using Feedback_Count */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                10. Total Feedback Responses by Category
              </h3>
              <p className="text-xs text-slate-500">
                Survey feedback engagement volume per event category
              </p>
            </div>
            <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
          </div>

          {hasFeedbackData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={feedbackByCategory}
                  margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
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
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Surveys`, 'Feedback Count']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="totalFeedback"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Feedback Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              Feedback_Count column not detected in dataset. Map the feedback column to enable survey volume analysis.
            </div>
          )}
        </div>
      </div>

      {/* Rating Tier Distribution & Top/Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
            Satisfaction Rating Tiers
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Count of events in each rating bracket
          </p>

          <div className="space-y-3">
            {ratingBucketData.map((item) => {
              const totalValidRatings = records.filter((r) => r.rating > 0).length;
              const percent = totalValidRatings > 0 ? ((item.count / totalValidRatings) * 100).toFixed(1) : '0';
              return (
                <div key={item.bucket}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{item.bucket}</span>
                    <span className="font-mono text-slate-500">{item.count} events ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Rated Events */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Highest-Rated Events
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">Top student satisfaction</p>

          <div className="divide-y divide-slate-100">
            {highestRated.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {evt.eventName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {evt.department} · {evt.category}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-emerald-600">
                    {evt.rating} ★
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {evt.feedbackCount > 0 ? `${evt.feedbackCount} reviews` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Rated Events */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1">
            <ThumbsDown className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Lowest-Rated Events
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">Improvement targets</p>

          <div className="divide-y divide-slate-100">
            {lowestRated.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {evt.eventName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {evt.department} · {evt.category}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-rose-600">
                    {evt.rating} ★
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {evt.feedbackCount > 0 ? `${evt.feedbackCount} reviews` : ''}
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
