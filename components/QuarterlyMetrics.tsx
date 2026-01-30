
import React from 'react';
import { QuarterlyUpdate, QUARTER_LABELS } from '../types';

interface QuarterlyMetricsProps {
  updates: QuarterlyUpdate[];
  onUpdate: (updates: QuarterlyUpdate[]) => void;
  isEnabled: boolean; // New prop to enable/disable editing
}

const QuarterlyMetrics: React.FC<QuarterlyMetricsProps> = ({ updates, onUpdate, isEnabled }) => {
  const handleCellChange = (category: string, q: keyof QuarterlyUpdate, value: string) => {
    if (!isEnabled) return; // Prevent changes if disabled
    const updated = updates.map(u => u.category === category ? { ...u, [q]: value } : u);
    onUpdate(updated);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full ${!isEnabled ? 'opacity-60' : ''}`}>
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
        <h2 className="text-white font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          Quarterly Performance Metrics
        </h2>
        <span className="text-slate-500 text-[8px] font-black uppercase tracking-tighter">Growth Ledger</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-3 py-2 w-[160px] text-slate-500 uppercase text-[9px] font-black tracking-widest">Category</th>
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <th key={q} className="px-3 py-2 border-l border-slate-200 text-indigo-900 uppercase text-[10px] font-black">
                  <div className="flex flex-col leading-none">
                    <span>{q}</span>
                    <span className="text-[8px] text-slate-400 font-bold mt-0.5">{QUARTER_LABELS[q]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {updates.map((row, idx) => (
              <tr key={row.category} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-indigo-50/20 transition-colors`}>
                <td className="px-3 py-2 align-middle">
                  <span className="font-bold text-slate-700 text-[11px] leading-tight">
                    {row.category}
                  </span>
                </td>
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
                  <td key={q} className="px-2 py-1 align-top border-l border-slate-100/30">
                    <textarea
                      value={row[q]}
                      onChange={(e) => handleCellChange(row.category, q, e.target.value)}
                      disabled={!isEnabled} // Disable textarea
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-100 rounded text-[11px] p-1 outline-none min-h-[60px] resize-none font-medium text-slate-600 placeholder:text-slate-200 transition-all focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                      placeholder="..."
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuarterlyMetrics;
