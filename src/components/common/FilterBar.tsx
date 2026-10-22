import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { FilterState } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  departments: string[];
  categories: string[];
  venues: string[];
  matchedCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  departments,
  categories,
  venues,
  matchedCount,
  totalCount,
}) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      department: 'ALL',
      category: 'ALL',
      venue: 'ALL',
      startDate: '',
      endDate: '',
      searchQuery: '',
    });
  };

  const isFiltered =
    filters.department !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.venue !== 'ALL' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
            Data Filters & Search
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Showing <strong className="text-slate-900 font-semibold">{matchedCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} events
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="self-start lg:self-auto flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Search Events
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              placeholder="Search by name, ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Venue
          </label>
          <select
            value={filters.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="ALL">All Venues ({venues.length})</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
