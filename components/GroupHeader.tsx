
import React from 'react';
import { GroupHeaderData } from '../types';

interface GroupHeaderProps {
  data: GroupHeaderData;
  onChange: (data: GroupHeaderData) => void;
  isEnabled: boolean;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ data, onChange, isEnabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const fields: { label: string; name: keyof GroupHeaderData; width?: string }[] = [
    { label: 'NLC No', name: 'nlcNo' },
    { label: 'Region', name: 'region' },
    { label: 'Year', name: 'year' },
    { label: 'Area Pastor', name: 'areaPastor' },
    { label: 'Leader', name: 'leaderName' },
    { label: 'Co-Leader', name: 'coLeader' },
    { label: 'Leader Phone', name: 'leaderPhone' },
  ];

  return (
    <div className="leadership-ledger-header space-y-6">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 print:border-b-4 print:border-black">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 print:text-[12pt]">
          <span className="w-4 h-4 bg-indigo-900 rounded-sm print:bg-black"></span>
          Leadership Identity Ledger
        </h2>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest print:text-black print:text-[10pt]">SEC. 01 • ADMIN</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:gap-2">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col group">
            <div className="flex items-stretch h-12 print:h-10">
              {/* Adjacent Label Box */}
              <div className="bg-slate-900 text-white border border-slate-900 rounded-l-lg px-3 flex items-center justify-center min-w-[120px] text-[10px] font-black uppercase tracking-widest transition-all group-focus-within:bg-indigo-600 group-focus-within:border-indigo-600 print:bg-slate-100 print:text-black print:border-black print:min-w-[110px] print:text-[9pt]">
                {field.label}
              </div>
              {/* Input Box */}
              <input
                type="text"
                name={field.name}
                value={data[field.name] || ''}
                onChange={handleChange}
                disabled={!isEnabled}
                className={`flex-grow px-4 bg-white border border-slate-200 border-l-0 rounded-r-lg outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition-all font-bold text-slate-800 text-sm print:text-[11pt] print:border-black print:border-l-0 ${!isEnabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}`}
                placeholder="..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupHeader;
