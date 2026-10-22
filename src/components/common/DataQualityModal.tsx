import React from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { DataQualityReport } from '../../types';

interface DataQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DataQualityReport;
  onOpenMappingModal: () => void;
  isDemoData: boolean;
}

export const DataQualityModal: React.FC<DataQualityModalProps> = ({
  isOpen,
  onClose,
  report,
  onOpenMappingModal,
  isDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dataset Quality & Validation Audit
              </h2>
              <p className="text-xs text-slate-500">
                Inspection results for {report.totalRawRows.toLocaleString()} rows and {report.detectedColumnsCount} mapped columns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Demo Data Notice */}
          {isDemoData && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Currently Viewing Generated Demo Dataset:</strong>
                <p className="mt-0.5 text-blue-800">
                  This demo dataset is generated deterministically to showcase all 10 analytical charts. When you upload your Kaggle CSV, real metrics and validation results will replace this audit.
                </p>
              </div>
            </div>
          )}

          {/* Critical Warnings */}
          {report.criticalWarnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Data Quality Notices ({report.criticalWarnings.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
                {report.criticalWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* KPI summary grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="text-[11px] font-medium text-slate-500">Total Raw Rows</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {report.totalRawRows.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="text-[11px] font-medium text-slate-500">Processed Rows</div>
              <div className="text-lg font-bold text-emerald-600 font-mono tabular-nums mt-0.5">
                {report.totalProcessedRows.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="text-[11px] font-medium text-slate-500">Duplicate Records</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {report.duplicateCount}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="text-[11px] font-medium text-slate-500">Mapped Columns</div>
              <div className="text-lg font-bold text-indigo-600 font-mono tabular-nums mt-0.5">
                {report.detectedColumnsCount} / {report.totalStandardColumns}
              </div>
            </div>
          </div>

          {/* Detailed Column Quality Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Column Completeness Breakdown
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onOpenMappingModal();
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Customize Column Mapping →
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Standard Field</th>
                    <th className="px-3 py-2.5">Mapped CSV Header</th>
                    <th className="px-3 py-2.5 text-right">Completeness</th>
                    <th className="px-3 py-2.5 text-right">Missing / Invalid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.columnsReport.map((col) => {
                    const isFullyComplete = col.completenessPercent >= 95;
                    const isMissing = !col.detected;
                    return (
                      <tr key={col.columnKey} className="hover:bg-slate-50/70">
                        <td className="px-3.5 py-2 font-medium text-slate-900 flex items-center gap-1.5">
                          {col.detected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] flex items-center justify-center text-slate-400">
                              -
                            </span>
                          )}
                          <span>{col.columnKey}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">
                          {col.headerName ? (
                            <span className="text-slate-800 font-medium">{col.headerName}</span>
                          ) : (
                            <span className="text-slate-400 italic">Not Mapped</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  isMissing
                                    ? 'bg-slate-300'
                                    : isFullyComplete
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${col.completenessPercent}%` }}
                              />
                            </div>
                            <span className="font-mono tabular-nums font-medium text-slate-700 w-10 text-right">
                              {col.completenessPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-500">
                          {col.missingRows + col.invalidRows > 0 ? (
                            <span className="text-amber-600">
                              {col.missingRows + col.invalidRows} rows
                            </span>
                          ) : (
                            <span className="text-emerald-600">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
