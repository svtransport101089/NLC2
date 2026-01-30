
import React from 'react';
import { NLCReport, CATEGORIES } from '../types';

interface NLCReportManagerProps {
  reports: NLCReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  onAddReport: () => void;
  onDeleteReport: (id: string) => void;
}

const NLCReportManager: React.FC<NLCReportManagerProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onAddReport,
  onDeleteReport,
}) => {
  const getReportLabel = (report: NLCReport) => {
    return `${report.header.nlcNo || 'New NLC'} - ${report.header.leaderName || 'No Leader'}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col mb-6 p-4">
      <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
          Manage NLC Reports
        </h2>
        <button
          onClick={onAddReport}
          className="bg-indigo-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-tight transition-all flex items-center gap-2 print:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Add New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-slate-500 py-6 text-sm">No reports created yet. Click "Add New Report" to begin!</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Select Report:
          </label>
          <div className="flex-grow">
            <select
              value={selectedReportId || ''}
              onChange={(e) => onSelectReport(e.target.value)}
              className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all outline-none font-medium text-slate-700 shadow-sm appearance-none pr-8 cursor-pointer w-full md:w-auto"
            >
              <option value="">-- Select an NLC Report --</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {getReportLabel(report)}
                </option>
              ))}
            </select>
          </div>
          {selectedReportId && (
            <button
              onClick={() => onDeleteReport(selectedReportId)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-tight transition-all flex items-center gap-2 print:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Selected
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NLCReportManager;
