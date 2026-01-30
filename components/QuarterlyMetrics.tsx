
import React from 'react';
import { QuarterlyUpdate, QUARTER_LABELS } from '../types';

interface QuarterlyMetricsProps {
  updates: QuarterlyUpdate[];
  onUpdate: (updates: QuarterlyUpdate[]) => void;
  isEnabled: boolean;
}

const QuarterlyMetrics: React.FC<QuarterlyMetricsProps> = ({ updates, onUpdate, isEnabled }) => {
  const handleCellChange = (category: string, q: keyof QuarterlyUpdate, value: string) => {
    if (!isEnabled) return;
    const updated = updates.map(u => u.category === category ? { ...u, [q]: value } : u);
    onUpdate(updated);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full print:border-2 print:border-black print:rounded-none print:shadow-none ${!isEnabled ? 'opacity-60' : ''}`}>
      {/* Table Header Section */}
      <div className="bg-slate-900 px-4 py-4 flex items-center justify-between print:bg-black print:px-3 print:py-2 print:border-b-2 print:border-black">
        <h2 className="text-white font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 print:text-[11pt] print:font-black">
          <span className="w-2.5 h-2.5 bg-indigo-400 rounded-sm print:bg-white print:border print:border-black"></span>
          Quarterly Performance Ledger
        </h2>
        <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest print:text-white print:text-[9pt]">SEC. 02 • RECORD</span>
      </div>

      <div className="overflow-x-auto print:overflow-visible flex-grow">
        <table className="w-full text-left table-fixed border-collapse print:border-none">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 print:bg-slate-100 print:border-b-2 print:border-black">
              {/* Category Header: 22% of the table width */}
              <th className="px-3 py-3 w-[160px] text-slate-900 uppercase text-[10px] font-black tracking-widest print:text-black print:text-[9pt] print:w-[22%] print:border-r-2 print:border-black">
                Category
              </th>
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <th key={q} className="px-3 py-3 border-l border-slate-200 text-indigo-900 uppercase text-[11px] font-black print:text-black print:border-black print:border-l print:text-[10pt] print:w-[19.5%] print:text-center">
                  <div className="flex flex-col leading-none">
                    <span className="print:font-black">{q}</span>
                    <span className="text-[8px] text-slate-500 font-bold mt-1 print:text-black print:text-[7pt] uppercase tracking-tighter">
                      {QUARTER_LABELS[q]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-black">
            {updates.map((row, idx) => (
              <tr key={row.category} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-indigo-50/20 transition-colors print:bg-white print:border-b print:border-black`}>
                <td className="px-3 py-4 align-top print:bg-slate-50 print:border-r-2 print:border-black print:py-3">
                  <span className="font-black text-slate-900 text-[11px] leading-tight print:text-[9.5pt] print:text-black uppercase tracking-tight block">
                    {row.category}
                  </span>
                </td>
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
                  <td key={q} className="px-2 py-2 align-top border-l border-slate-100 print:border-black print:border-l print:p-2">
                    <div className="relative group h-full">
                      {/* Interactive Textarea for Screen */}
                      <textarea
                        value={row[q]}
                        onChange={(e) => handleCellChange(row.category, q, e.target.value)}
                        disabled={!isEnabled}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-100 rounded text-[11px] p-1 outline-none min-h-[80px] resize-none font-medium text-slate-700 placeholder:text-slate-200 transition-all focus:bg-white disabled:cursor-not-allowed print:hidden"
                        placeholder="..."
                      />
                      {/* Print-Only View: Centered alignment for data points with reliable overflow */}
                      <div className="hidden print:block text-[9.5pt] text-black leading-[1.4] font-medium min-h-[50pt] whitespace-pre-wrap break-words text-center">
                        {row[q] || "—"}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Branding for Print - Placed at the very bottom of the ledger component */}
      <div className="hidden print:flex justify-between items-center px-4 py-3 border-t-2 border-black bg-slate-50">
        <div className="flex flex-col">
          <span className="text-[8pt] font-black text-black uppercase tracking-widest italic leading-tight">Authentic Performance Audit</span>
          <span className="text-[7pt] font-bold text-slate-500 uppercase tracking-tighter">Verified against internal group records</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-black"></div>
            </div>
            <span className="text-[8pt] font-black text-black uppercase">Complete</span>
          </div>
          <div className="w-px h-6 bg-black"></div>
          <div className="text-right">
             <span className="text-[7pt] font-black text-black block uppercase">Sign: __________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyMetrics;
