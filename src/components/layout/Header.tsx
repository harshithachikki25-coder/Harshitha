import React, { useRef } from 'react';
import {
  Menu,
  Upload,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { DataQualityReport } from '../../types';

interface HeaderProps {
  activeTab: NavTab;
  onOpenMobileSidebar: () => void;
  onFileUpload: (file: File) => void;
  onResetDemo: () => void;
  onOpenQualityModal: () => void;
  onOpenMappingModal: () => void;
  isDemoData: boolean;
  qualityReport: DataQualityReport;
  fileName: string | null;
  filteredCount: number;
  totalCount: number;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Dashboard',
    subtitle: 'High-level metrics, attendance distribution, and core performance indicators',
  },
  'event-analytics': {
    title: 'Event Analytics',
    subtitle: 'Top events by attendance, capacity vs turnout scatter, and low-attendance alerts',
  },
  'department-analytics': {
    title: 'Department Analytics',
    subtitle: 'Inter-department participation comparisons, budgets, and ratings',
  },
  participation: {
    title: 'Participation & Capacity Trends',
    subtitle: 'Time-series attendance curves, venue efficiency, and capacity utilization rates',
  },
  feedback: {
    title: 'Student Feedback Analysis',
    subtitle: 'Rating distributions, satisfaction scores, and feedback survey volumes',
  },
  'dataset-explorer': {
    title: 'Dataset Explorer',
    subtitle: 'Searchable row inspector, schema completeness, and CSV export tools',
  },
  about: {
    title: 'About College Project',
    subtitle: 'B.Tech academic documentation, formulas, architecture, and recommendations',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onFileUpload,
  onResetDemo,
  onOpenQualityModal,
  onOpenMappingModal,
  isDemoData,
  qualityReport,
  fileName,
  filteredCount,
  totalCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const hasWarnings = qualityReport.criticalWarnings.length > 0;
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'Analytics Dashboard',
    subtitle: 'Campus event analysis',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3.5 gap-4">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Campus Analytics</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-700 font-medium">{currentTabInfo.title}</span>
            </div>
            <h1 className="text-base lg:text-lg font-bold text-slate-900 truncate">
              {currentTabInfo.title}
            </h1>
          </div>
        </div>

        {/* Center / Right Status & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dataset Status Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs text-slate-600 border border-slate-200/80">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-800">
              {isDemoData ? 'Demo Dataset' : fileName || 'Custom CSV'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono tabular-nums text-slate-600">
              {filteredCount < totalCount
                ? `${filteredCount.toLocaleString()} / ${totalCount.toLocaleString()}`
                : `${totalCount.toLocaleString()} rows`}
            </span>
          </div>

          {/* Quality Audit Button */}
          <button
            onClick={onOpenQualityModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              hasWarnings
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Inspect Data Quality & Missing Values"
          >
            {hasWarnings ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="hidden md:inline">Quality Report</span>
            {hasWarnings && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/80 text-amber-900 font-semibold">
                {qualityReport.criticalWarnings.length}
              </span>
            )}
          </button>

          {/* Reset Demo Button (if uploaded dataset) */}
          {!isDemoData && (
            <button
              onClick={onResetDemo}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Reset to 1,000+ Demo Records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />

          {/* Upload CSV CTA */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Kaggle CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
