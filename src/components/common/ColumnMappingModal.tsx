import React, { useState } from 'react';
import { X, Columns3, Check } from 'lucide-react';
import { ColumnMapping, StandardColumnKey } from '../../types';
import { STANDARD_COLUMNS } from '../../utils/dataProcessor';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableHeaders: string[];
  currentMapping: ColumnMapping;
  onSaveMapping: (newMapping: ColumnMapping) => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  availableHeaders,
  currentMapping,
  onSaveMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...currentMapping });

  if (!isOpen) return null;

  const handleSelect = (key: StandardColumnKey, header: string) => {
    setMapping((prev) => ({
      ...prev,
      [key]: header === '' ? null : header,
    }));
  };

  const handleSave = () => {
    onSaveMapping(mapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Columns3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Custom Column Mapping
              </h2>
              <p className="text-xs text-slate-500">
                Match your CSV column names to the analytics standard schema
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="text-xs text-slate-600 mb-2">
            Select the corresponding column from your uploaded file for each metric below:
          </div>

          <div className="space-y-2.5">
            {STANDARD_COLUMNS.map((col) => {
              const selectedValue = mapping[col.key] || '';
              return (
                <div
                  key={col.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800">
                        {col.label}
                      </span>
                      {col.required && (
                        <span className="text-[10px] text-rose-600 font-medium">
                          (Required)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Type: {col.type}
                    </span>
                  </div>

                  <select
                    value={selectedValue}
                    onChange={(e) => handleSelect(col.key, e.target.value)}
                    className="sm:w-60 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Not in dataset --</option>
                    {availableHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Mapping & Re-calculate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
