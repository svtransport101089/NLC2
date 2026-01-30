
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GroupHeaderData, Member, QuarterlyUpdate, CATEGORIES, NLCReport } from './types';
import GroupHeader from './components/GroupHeader';
import MembersTable from './components/MembersTable';
import QuarterlyMetrics from './components/QuarterlyMetrics';
import NLCReportManager from './components/NLCReportManager'; // New import
import { analyzeReport } from './services/geminiService';

const STORAGE_KEY = 'nlc_tracker_data_v2'; // Updated storage key for multi-report structure

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nlcReports, setNlcReports] = useState<NLCReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.nlcReports)) {
          return parsed.nlcReports;
        }
      } catch (e) { console.error("Failed to parse NLC reports from localStorage:", e); }
    }
    // Default initial report
    const initialReport: NLCReport = {
      id: 'default-nlc-report-1',
      header: {
        nlcNo: '102',
        region: 'South Dist',
        areaPastor: 'Rev. Smith',
        leaderName: 'John Doe',
        coLeader: 'Jane Roe',
        year: '2026'
      },
      members: [
        { id: '1', sn: 1, name: 'Judah', regNo: 'Registered', phone: '555-0101' },
        { id: '2', sn: 2, name: 'Isak', regNo: 'Registered', phone: '555-0102' },
        { id: '3', sn: 3, name: 'Arul Rithis', regNo: 'Irregular', phone: '555-0103' },
        { id: '4', sn: 4, name: 'Akash', regNo: 'Registered', phone: '555-0104' },
        { id: '5', sn: 5, name: 'Sam Alwino', regNo: 'Registered', phone: '555-0105' },
      ],
      updates: CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' })),
    };
    return [initialReport];
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        if (savedData.selectedReportId && savedData.nlcReports.some((r: NLCReport) => r.id === savedData.selectedReportId)) {
          return savedData.selectedReportId;
        }
      } catch (e) { console.error("Failed to parse selected report ID from localStorage:", e); }
    }
    // If no saved ID or it's invalid, select the first report if available
    return nlcReports.length > 0 ? nlcReports[0].id : null;
  });

  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Derive the current active report
  const currentReport = useMemo(() => {
    return nlcReports.find(report => report.id === selectedReportId);
  }, [nlcReports, selectedReportId]);

  // --- Persistence to localStorage ---
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const dataToSave = { nlcReports, selectedReportId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setSaveStatus('saved');
    }, 500); 
    return () => clearTimeout(timer);
  }, [nlcReports, selectedReportId]);

  // --- NLC Report Management Callbacks ---
  const handleSelectReport = useCallback((id: string) => {
    setSelectedReportId(id);
    setAiResult(null); // Clear AI result when switching reports
  }, []);

  const handleAddReport = useCallback(() => {
    const newReportId = Math.random().toString(36).substr(2, 9);
    const newReport: NLCReport = {
      id: newReportId,
      header: {
        nlcNo: (nlcReports.length + 1).toString().padStart(3, '0'), // Simple auto-increment NLC No
        region: 'New Region',
        areaPastor: 'New Pastor',
        leaderName: 'New Leader',
        coLeader: '',
        year: new Date().getFullYear().toString()
      },
      members: [],
      updates: CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' })),
    };
    setNlcReports(prev => [...prev, newReport]);
    setSelectedReportId(newReportId);
    setAiResult(null);
  }, [nlcReports.length]);

  const handleDeleteReport = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this NLC report? This cannot be undone.')) {
      setNlcReports(prevReports => {
        const updatedReports = prevReports.filter(report => report.id !== id);
        // If the deleted report was the currently selected one,
        // then select the first available report or null if no reports are left.
        if (selectedReportId === id) {
          setSelectedReportId(updatedReports.length > 0 ? updatedReports[0].id : null);
        }
        return updatedReports;
      });
      setAiResult(null);
    }
  }, [selectedReportId]); // Only selectedReportId is needed in dependency for checking

  // --- Update handlers for current report's data ---
  const updateCurrentReport = useCallback((field: 'header' | 'members' | 'updates', data: any) => {
    if (!selectedReportId) return;

    setNlcReports(prevReports =>
      prevReports.map(report =>
        report.id === selectedReportId
          ? { ...report, [field]: data }
          : report
      )
    );
  }, [selectedReportId]);

  const handleHeaderChange = useCallback((data: GroupHeaderData) => {
    updateCurrentReport('header', data);
  }, [updateCurrentReport]);

  const handleMembersUpdate = useCallback((data: Member[]) => {
    updateCurrentReport('members', data);
  }, [updateCurrentReport]);

  const handleUpdatesUpdate = useCallback((data: QuarterlyUpdate[]) => {
    updateCurrentReport('updates', data);
  }, [updateCurrentReport]);

  // --- AI Analysis ---
  const handleAnalyze = async () => {
    if (!currentReport) return;
    setIsAnalyzing(true);
    const result = await analyzeReport(currentReport.header, currentReport.members, currentReport.updates);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  // --- Utility Functions ---
  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear ALL NLC Reports data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = { nlcReports, selectedReportId, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nlc_tracker_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.nlcReports && Array.isArray(json.nlcReports) && (json.selectedReportId === null || typeof json.selectedReportId === 'string')) {
          if (window.confirm('This will overwrite all your current NLC Reports data. Continue?')) {
            setNlcReports(json.nlcReports);
            // Ensure selectedReportId exists in the imported reports
            if (json.nlcReports.some((r: NLCReport) => r.id === json.selectedReportId)) {
              setSelectedReportId(json.selectedReportId);
            } else if (json.nlcReports.length > 0) {
              setSelectedReportId(json.nlcReports[0].id);
            } else {
              setSelectedReportId(null);
            }
            setAiResult(null);
            alert('NLC Reports database imported successfully!');
          }
        } else {
          alert('Invalid file format. Please use a valid NLC Reports backup JSON file.');
        }
      } catch (err) {
        alert('Failed to read file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input so the same file can be picked again
  };

  const isEditingEnabled = currentReport !== undefined && currentReport !== null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 transition-all">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 9pt;
          }
          .min-h-screen {
            padding: 0 !important;
            background: #ffffff !important;
          }
          .max-w-screen-2xl, .max-w-\\[1920px\\] {
            max-width: none !important;
            width: 100% !important;
          }
          .print-grid-layout {
            display: grid !important;
            grid-template-columns: 3.5fr 8.5fr !important;
            gap: 10px !important;
            align-items: start !important;
          }
          .shadow-2xl, .shadow-sm, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          .rounded-3xl, .rounded-2xl {
            border-radius: 4px !important;
            border: 1px solid #cbd5e1 !important;
          }
          .bg-white {
            background: white !important;
          }
          button, .print-hidden, .file-input {
            display: none !important;
          }
          input, select, textarea {
            border: none !important;
            background: transparent !important;
            padding: 1px !important;
            font-weight: 500 !important;
          }
          textarea {
            height: auto !important;
            min-height: unset !important;
          }
          .bg-indigo-900 { background-color: #1e1b4b !important; }
          .section-block {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".json" 
        className="hidden file-input" 
      />

      <div className="max-w-[1920px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 px-4 print-hidden">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">NLC Leadership Tracker</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase transition-all ${saveStatus === 'saved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                  {saveStatus === 'saved' ? '✓ Auto-Saved (Browser)' : '... Syncing'}
                </span>
              </div>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mt-1">Full Landscape Reporting Method</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Primary Actions */}
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              title="Download local database backup as a file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Save Database (File)
            </button>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
              title="Print current report in landscape format"
              disabled={!isEditingEnabled}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !isEditingEnabled}
              className={`flex items-center gap-2 bg-indigo-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 ${isAnalyzing || !isEditingEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Get AI-powered analysis of your report"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {isAnalyzing ? 'Analyzing...' : 'AI Audit'}
            </button>

            {/* Utility Actions */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl gap-1 ml-4"> {/* Added ml-4 for separation */}
              <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:text-indigo-600 transition-all shadow-sm"
                title="Load database from a backup file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Import
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:text-red-500 transition-all shadow-sm"
                title="Clear all data (resets to default)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Reset
              </button>
            </div>
          </div>
        </header>

        {/* Main Landscape Ledger Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 lg:p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-900 print:h-1"></div>
          
          <NLCReportManager
            reports={nlcReports}
            selectedReportId={selectedReportId}
            onSelectReport={handleSelectReport}
            onAddReport={handleAddReport}
            onDeleteReport={handleDeleteReport}
          />

          {!isEditingEnabled && nlcReports.length > 0 && (
            <div className="text-center text-slate-600 py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-lg font-bold mb-2">No NLC Report Selected</p>
              <p className="text-sm">Please select a report from the "Manage NLC Reports" section above to view or edit its data.</p>
            </div>
          )}

          {!isEditingEnabled && nlcReports.length === 0 && (
            <div className="text-center text-slate-600 py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-lg font-bold mb-2">No NLC Reports Available</p>
              <p className="text-sm">Click "Add New Report" above to create your first NLC report.</p>
            </div>
          )}

          {isEditingEnabled && currentReport && (
            <>
              <div className="section-block">
                <GroupHeader data={currentReport.header} onChange={handleHeaderChange} isEnabled={isEditingEnabled} />
              </div>

              {aiResult && (
                <div className="section-block bg-indigo-50/30 border-l-4 border-indigo-900 rounded-r-xl p-6 relative animate-in fade-in slide-in-from-top-2 duration-300 print:bg-white print:border-slate-200">
                  <button onClick={() => setAiResult(null)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 print:hidden">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-indigo-900 font-bold text-sm mb-2 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    AI Performance Analysis
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {aiResult}
                  </div>
                </div>
              )}

              {/* Adjacent Side-by-Side Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print-grid-layout">
                <div className="lg:col-span-4 section-block h-full">
                  <MembersTable members={currentReport.members} onUpdate={handleMembersUpdate} isEnabled={isEditingEnabled} />
                </div>
                <div className="lg:col-span-8 section-block h-full">
                  <QuarterlyMetrics updates={currentReport.updates} onUpdate={handleUpdatesUpdate} isEnabled={isEditingEnabled} />
                </div>
              </div>
            </>
          )}
        </div>

        <footer className="flex flex-col md:flex-row justify-between items-center py-6 px-4 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] print:mt-4">
          <p>NLC LEADERSHIP TRACKER • LANDSCAPE MODE</p>
          <p className="mt-2 md:mt-0">© {new Date().getFullYear()} CONFIDENTIAL • Data auto-saved to browser & exportable as file</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
