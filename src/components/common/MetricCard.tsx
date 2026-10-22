import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number | null;
  subtitle?: string;
  icon: LucideIcon;
  isAvailable?: boolean;
  unavailableReason?: string;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  isAvailable = true,
  unavailableReason = 'Column not in dataset',
  accentColor = 'indigo',
}) => {
  const iconBgMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div
      className={`relative bg-white border rounded-xl p-5 transition-shadow shadow-2xs ${
        isAvailable ? 'border-slate-200/90 hover:shadow-xs' : 'border-slate-200/60 bg-slate-50/50 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </span>
          {isAvailable ? (
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                {value !== null && value !== undefined ? value : '—'}
              </span>
            </div>
          ) : (
            <div className="mt-2 text-xs font-medium text-slate-400 italic">
              {unavailableReason}
            </div>
          )}
        </div>

        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${iconBgMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && isAvailable && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
