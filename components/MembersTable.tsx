
import React from 'react';
import { Member } from '../types';

interface MembersTableProps {
  members: Member[];
  onUpdate: (members: Member[]) => void;
  isEnabled: boolean; // New prop to enable/disable editing
}

const MembersTable: React.FC<MembersTableProps> = ({ members, onUpdate, isEnabled }) => {
  const handleMemberChange = (id: string, field: keyof Member, value: string | number) => {
    if (!isEnabled) return; // Prevent changes if disabled
    const updated = members.map(m => m.id === id ? { ...m, [field]: value } : m);
    onUpdate(updated);
  };

  const addMember = () => {
    if (!isEnabled) return;
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      sn: members.length + 1,
      name: '',
      regNo: 'Registered',
      phone: ''
    };
    onUpdate([...members, newMember]);
  };

  const removeMember = (id: string) => {
    if (!isEnabled) return;
    onUpdate(members.filter(m => m.id !== id).map((m, idx) => ({ ...m, sn: idx + 1 })));
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full ${!isEnabled ? 'opacity-60' : ''}`}>
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Active Members</h2>
          <p className="text-[8px] text-slate-500 font-bold uppercase">Roster: {members.length}</p>
        </div>
        <button 
          onClick={addMember}
          disabled={!isEnabled} // Disable button
          className="bg-indigo-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-1 print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Add
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-3 py-2 w-10 text-slate-400 uppercase text-[8px] font-black">SN</th>
              <th className="px-3 py-2 text-slate-500 uppercase text-[8px] font-black tracking-widest">Name</th>
              <th className="px-3 py-2 text-slate-500 uppercase text-[8px] font-black tracking-widest">Status</th>
              <th className="px-3 py-2 text-slate-500 uppercase text-[8px] font-black tracking-widest">Phone</th>
              <th className="px-3 py-2 w-8 print:hidden"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member, idx) => (
              <tr key={member.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} hover:bg-indigo-50/10 transition-all`}>
                <td className="px-3 py-2 text-slate-400 font-mono text-[10px]">{member.sn}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                    disabled={!isEnabled} // Disable input
                    className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 text-[11px] p-0 placeholder:text-slate-200 disabled:cursor-not-allowed"
                    placeholder="Name..."
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={member.regNo}
                    onChange={(e) => handleMemberChange(member.id, 'regNo', e.target.value)}
                    disabled={!isEnabled} // Disable select
                    className={`bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase cursor-pointer p-0 ${
                      member.regNo === 'Registered' ? 'text-green-600' : 'text-amber-500'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <option value="Registered">Reg</option>
                    <option value="Irregular">Irr</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={member.phone}
                    onChange={(e) => handleMemberChange(member.id, 'phone', e.target.value)}
                    disabled={!isEnabled} // Disable input
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-[10px] text-slate-500 p-0 disabled:cursor-not-allowed"
                    placeholder="000..."
                  />
                </td>
                <td className="px-3 py-2 print:hidden text-right">
                  <button 
                    onClick={() => removeMember(member.id)}
                    disabled={!isEnabled} // Disable button
                    className="text-slate-200 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersTable;
