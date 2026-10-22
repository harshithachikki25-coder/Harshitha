import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  Columns3,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StandardEventRecord, DataQualityReport, ColumnMapping } from '../../types';
import { exportRecordsToCSV, STANDARD_COLUMNS } from '../../utils/dataProcessor';

interface DatasetExplorerViewProps {
  records: StandardEventRecord[];
  rawTotalRows: number;
  qualityReport: DataQualityReport;
  columnMapping: ColumnMapping;
  onOpenMappingModal: () => void;
  onOpenQualityModal: () => void;
  isDemoData: boolean;
}

type SortField =
  | 'id'
  | 'eventName'
  | 'department'
  | 'category'
  | 'eventDate'
  | 'participants'
  | 'capacity'
  | 'rating'
  | 'budget'
  | 'capacityUtilization';

export const DatasetExplorerView: React.FC<DatasetExplorerViewProps> = ({
  records,
  rawTotalRows,
  qualityReport,
  columnMapping,
  onOpenMappingModal,
  onOpenQualityModal,
  isDemoData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('eventDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Filter & sort
  const filteredAndSortedRecords = useMemo(() => {
    let result = records;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.eventName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.venue.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Overview Card with Schema Summary & Actions */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Dataset Schema & Column Completeness
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspecting {records.length.toLocaleString()} processed rows ({rawTotalRows.toLocaleString()} raw imported)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenMappingModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Map Columns</span>
            </button>

            <button
              onClick={onOpenQualityModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Quality</span>
            </button>

            <button
              onClick={() => exportRecordsToCSV(records)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Schema Summary Pills */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {STANDARD_COLUMNS.map((col) => {
            const mappedHeader = columnMapping[col.key];
            const qReport = qualityReport.columnsReport.find((q) => q.columnKey === col.key);
            const isMissing = !mappedHeader;
            return (
              <div
                key={col.key}
                className={`p-2.5 rounded-lg border text-xs ${
                  isMissing
                    ? 'border-dashed border-slate-200 bg-slate-50/50 text-slate-400'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 truncate">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {col.type}
                  </span>
                </div>
                <div className="mt-1 text-[11px] truncate font-mono">
                  {mappedHeader ? (
                    <span className="text-indigo-600 font-medium">{mappedHeader}</span>
                  ) : (
                    <span className="text-slate-400 italic">Not found</span>
                  )}
                </div>
                <div className="mt-1 text-[10px] font-mono text-slate-500">
                  {qReport ? `${qReport.completenessPercent}% valid` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table & Pagination Box */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search in table..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">
              Rows per page:
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-1.5 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-500">
              {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredAndSortedRecords.length)} of{' '}
              {filteredAndSortedRecords.length}
            </span>
          </div>
        </div>

        {/* Paginated Data Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('eventName')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Event Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Department</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('eventDate')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('participants')}
                  className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Turnout</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('capacity')}
                  className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Capacity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('capacityUtilization')}
                  className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Util %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rating')}
                  className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Rating</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('budget')}
                  className="px-3 py-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Budget</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-2.5">Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500 font-semibold">
                      {r.id}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[170px]">
                      {r.eventName}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {r.category}
                    </td>
                    <td className="px-3 py-2 text-slate-600 truncate max-w-[130px]">
                      {r.department}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap">
                      {r.eventDate}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                      {r.participants.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">
                      {r.capacity > 0 ? r.capacity.toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium text-emerald-600">
                      {r.capacity > 0 ? `${r.capacityUtilization}%` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-amber-600">
                      {r.rating > 0 ? `${r.rating} ★` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700">
                      {r.budget > 0 ? `$${r.budget.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-500 truncate max-w-[130px]">
                      {r.venue}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-xs text-slate-400">
                    No events match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
          <div>
            Page <span className="font-mono font-bold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-mono">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
