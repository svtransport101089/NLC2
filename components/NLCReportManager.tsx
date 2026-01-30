
import React from 'react';
import { NLCReport } from '../types';

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
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-grow">
          <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-4 py-1.5 shadow-sm group focus-within:border-indigo-500 transition-all flex-grow max-w-md">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">Active Report:</span>
            <select
              value={selectedReportId || ''}
              onChange={(e) => onSelectReport(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 outline-none w-full cursor-pointer py-1"
            >
              <option value="">-- Choose NLC Report --</option>
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.header.nlcNo || '??'} | {r.header.leaderName || 'Untitled'}
                </option>
              ))}
            </select>
          </div>
          
          {selectedReportId && (
            <button
              onClick={() => onDeleteReport(selectedReportId)}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Delete this report"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            disabled={!selectedReportId}
            className="flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
          <button
            onClick={onAddReport}
            className="flex items-center justify-center gap-2 bg-indigo-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Add New
          </button>
        </div>
      </div>
    </div>
  );
};

export default NLCReportManager;
