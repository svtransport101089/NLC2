
import React from 'react';
import { GroupHeaderData } from '../types';

interface GroupHeaderProps {
  data: GroupHeaderData;
  onChange: (data: GroupHeaderData) => void;
  isEnabled: boolean; // New prop to enable/disable editing
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ data, onChange, isEnabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const fields: { label: string; name: keyof GroupHeaderData; }[] = [
    { label: 'NLC No', name: 'nlcNo' },
    { label: 'Region', name: 'region' },
    { label: 'Area Pastor', name: 'areaPastor' },
    { label: 'Leader Name', name: 'leaderName' },
    { label: 'Co-Leader', name: 'coLeader' },
    { label: 'Year', name: 'year' },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
        Leadership Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              {field.label}
            </label>
            <input
              type="text"
              name={field.name}
              value={data[field.name] as string}
              onChange={handleChange}
              disabled={!isEnabled} // Disable based on isEnabled prop
              className={`px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all outline-none font-medium text-slate-700 shadow-sm ${!isEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupHeader;
