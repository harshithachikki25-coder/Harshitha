/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/common/FilterBar';
import { DataQualityModal } from './components/common/DataQualityModal';
import { ColumnMappingModal } from './components/common/ColumnMappingModal';
import { DashboardView } from './components/views/DashboardView';
import { EventAnalyticsView } from './components/views/EventAnalyticsView';
import { DepartmentAnalyticsView } from './components/views/DepartmentAnalyticsView';
import { ParticipationView } from './components/views/ParticipationView';
import { FeedbackView } from './components/views/FeedbackView';
import { DatasetExplorerView } from './components/views/DatasetExplorerView';
import { AboutView } from './components/views/AboutView';
import { DEMO_DATASET } from './data/demoData';
import {
  StandardEventRecord,
  ColumnMapping,
  FilterState,
  DataQualityReport,
} from './types';
import {
  autoDetectColumnMapping,
  processRawCSVData,
  applyFilters,
  computeSummaryMetrics,
  generateRealDataInsights,
  STANDARD_COLUMNS,
} from './utils/dataProcessor';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Dataset states
  const [isDemoData, setIsDemoData] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(() => {
    // Default mapping for demo data
    const map: ColumnMapping = {} as ColumnMapping;
    STANDARD_COLUMNS.forEach((c) => {
      map[c.key] = c.key;
    });
    return map;
  });

  // Active records: either processed from uploaded CSV or default demo dataset
  const { allRecords, qualityReport } = useMemo(() => {
    if (isDemoData) {
      // Create quality report for demo dataset
      const report: DataQualityReport = {
        totalRawRows: DEMO_DATASET.length,
        totalProcessedRows: DEMO_DATASET.length,
        duplicateCount: 0,
        detectedColumnsCount: STANDARD_COLUMNS.length,
        totalStandardColumns: STANDARD_COLUMNS.length,
        columnsReport: STANDARD_COLUMNS.map((col) => ({
          columnKey: col.key,
          headerName: col.key,
          detected: true,
          totalRows: DEMO_DATASET.length,
          validRows: DEMO_DATASET.length,
          missingRows: 0,
          invalidRows: 0,
          completenessPercent: 100,
        })),
        criticalWarnings: [],
      };
      return {
        allRecords: DEMO_DATASET,
        qualityReport: report,
      };
    }

    // Process from raw rows with current column mapping
    const result = processRawCSVData(rawRows, columnMapping, true);
    return {
      allRecords: result.records,
      qualityReport: result.qualityReport,
    };
  }, [isDemoData, rawRows, columnMapping]);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    department: 'ALL',
    category: 'ALL',
    venue: 'ALL',
    startDate: '',
    endDate: '',
    searchQuery: '',
  });

  // Extract distinct departments, categories, venues for filters
  const { departments, categories, venues } = useMemo(() => {
    const deptSet = new Set<string>();
    const catSet = new Set<string>();
    const venSet = new Set<string>();

    allRecords.forEach((r) => {
      if (r.department) deptSet.add(r.department);
      if (r.category) catSet.add(r.category);
      if (r.venue) venSet.add(r.venue);
    });

    return {
      departments: Array.from(deptSet).sort(),
      categories: Array.from(catSet).sort(),
      venues: Array.from(venSet).sort(),
    };
  }, [allRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return applyFilters(allRecords, filters);
  }, [allRecords, filters]);

  // Derived Metrics & Real Insights
  const summaryMetrics = useMemo(() => {
    return computeSummaryMetrics(filteredRecords, isDemoData ? undefined : columnMapping);
  }, [filteredRecords, isDemoData, columnMapping]);

  const insights = useMemo(() => {
    return generateRealDataInsights(filteredRecords, summaryMetrics);
  }, [filteredRecords, summaryMetrics]);

  // Handle CSV file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file type. Please upload a standard comma-separated .csv file.');
      return;
    }

    setIsLoadingFile(true);
    setUploadError(null);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        setIsLoadingFile(false);
        if (results.errors && results.errors.length > 0 && results.data.length === 0) {
          setUploadError(`Failed to parse CSV: ${results.errors[0].message}`);
          return;
        }

        const data = results.data;
        if (!data || data.length === 0) {
          setUploadError('Uploaded CSV file contains no data rows.');
          return;
        }

        const headers = results.meta.fields || Object.keys(data[0] || {});
        const detectedMapping = autoDetectColumnMapping(headers);

        setRawRows(data);
        setAvailableHeaders(headers);
        setColumnMapping(detectedMapping);
        setFileName(file.name);
        setIsDemoData(false);

        // Reset filter states
        setFilters({
          department: 'ALL',
          category: 'ALL',
          venue: 'ALL',
          startDate: '',
          endDate: '',
          searchQuery: '',
        });

        // Open quality modal briefly if there are warnings or missing columns
        const missingCount = Object.values(detectedMapping).filter((v) => v === null).length;
        if (missingCount > 3) {
          setIsQualityModalOpen(true);
        }
      },
      error: (err) => {
        setIsLoadingFile(false);
        setUploadError(`Error reading file: ${err.message}`);
      },
    });
  }, []);

  // Reset to Demo Dataset
  const handleResetDemo = useCallback(() => {
    setIsDemoData(true);
    setFileName(null);
    setRawRows([]);
    setUploadError(null);
    const map: ColumnMapping = {} as ColumnMapping;
    STANDARD_COLUMNS.forEach((c) => {
      map[c.key] = c.key;
    });
    setColumnMapping(map);
    setFilters({
      department: 'ALL',
      category: 'ALL',
      venue: 'ALL',
      startDate: '',
      endDate: '',
      searchQuery: '',
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Dark Navy-Blue Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        totalEventsCount={allRecords.length}
        isDemoData={isDemoData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-68">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onFileUpload={handleFileUpload}
          onResetDemo={handleResetDemo}
          onOpenQualityModal={() => setIsQualityModalOpen(true)}
          onOpenMappingModal={() => setIsMappingModalOpen(true)}
          isDemoData={isDemoData}
          qualityReport={qualityReport}
          fileName={fileName}
          filteredCount={filteredRecords.length}
          totalCount={allRecords.length}
        />

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="mx-4 lg:mx-8 mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <div>
              <strong>Upload Notice:</strong> {uploadError}
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-rose-600 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Spinner for large datasets */}
        {isLoadingFile && (
          <div className="mx-4 lg:mx-8 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Processing and analyzing uploaded dataset rows...</span>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Universal Filter Bar (visible on all analytics views except About) */}
          {activeTab !== 'about' && (
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              departments={departments}
              categories={categories}
              venues={venues}
              matchedCount={filteredRecords.length}
              totalCount={allRecords.length}
            />
          )}

          {/* Active View Routing */}
          {activeTab === 'dashboard' && (
            <DashboardView
              records={filteredRecords}
              metrics={summaryMetrics}
              insights={insights}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'event-analytics' && (
            <EventAnalyticsView
              records={filteredRecords}
              hasCapacityData={summaryMetrics.hasCapacityData}
            />
          )}

          {activeTab === 'department-analytics' && (
            <DepartmentAnalyticsView
              records={filteredRecords}
              hasBudgetData={summaryMetrics.hasBudgetData}
            />
          )}

          {activeTab === 'participation' && (
            <ParticipationView
              records={filteredRecords}
              hasCapacityData={summaryMetrics.hasCapacityData}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackView
              records={filteredRecords}
              hasRatingData={summaryMetrics.hasRatingData}
              hasFeedbackData={summaryMetrics.hasFeedbackData}
            />
          )}

          {activeTab === 'dataset-explorer' && (
            <DatasetExplorerView
              records={filteredRecords}
              rawTotalRows={qualityReport.totalRawRows}
              qualityReport={qualityReport}
              columnMapping={columnMapping}
              onOpenMappingModal={() => setIsMappingModalOpen(true)}
              onOpenQualityModal={() => setIsQualityModalOpen(true)}
              isDemoData={isDemoData}
            />
          )}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>

      {/* Modals */}
      <DataQualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        report={qualityReport}
        onOpenMappingModal={() => setIsMappingModalOpen(true)}
        isDemoData={isDemoData}
      />

      <ColumnMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        availableHeaders={availableHeaders}
        currentMapping={columnMapping}
        onSaveMapping={(newMap) => setColumnMapping(newMap)}
      />
    </div>
  );
}
