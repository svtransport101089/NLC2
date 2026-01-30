
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GroupHeaderData, Member, QuarterlyUpdate, CATEGORIES, NLCReport } from './types';
import GroupHeader from './components/GroupHeader';
import MembersTable from './components/MembersTable';
import QuarterlyMetrics from './components/QuarterlyMetrics';
import NLCReportManager from './components/NLCReportManager';
import { analyzeReport } from './services/geminiService';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEY = 'nlc_tracker_data_v2';
const FIREBASE_DOC_ID = 'nlc_global_store';

const App: React.FC = () => {
  const [nlcReports, setNlcReports] = useState<NLCReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'permission-denied'>('saved');
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsFirebaseLoading(true);
      const saved = localStorage.getItem(STORAGE_KEY);
      let localDataFound = false;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.nlcReports && parsed.nlcReports.length > 0) {
            setNlcReports(parsed.nlcReports);
            setSelectedReportId(parsed.selectedReportId);
            localDataFound = true;
          }
        } catch (e) {
          console.error("Local storage parse error", e);
        }
      }

      try {
        const docRef = doc(db, "app_data", FIREBASE_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.nlcReports) {
            setNlcReports(cloudData.nlcReports);
            setSelectedReportId(cloudData.selectedReportId || cloudData.nlcReports[0]?.id);
          }
        } else if (!localDataFound) {
          const defaultReport: NLCReport = {
            id: 'default-nlc-report-1',
            header: {
              nlcNo: '102',
              region: 'South Dist',
              areaPastor: 'Rev. Smith',
              leaderName: 'John Doe',
              coLeader: 'Jane Roe',
              leaderPhone: '',
              year: '2026'
            },
            members: [{ id: '1', sn: 1, name: 'Judah', regNo: 'Registered', phone: '555-0101' }],
            updates: CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' })),
          };
          setNlcReports([defaultReport]);
          setSelectedReportId(defaultReport.id);
        }
      } catch (error: any) {
        console.warn("Firebase fetch failed, falling back to local:", error.message);
        if (!localDataFound && nlcReports.length === 0) {
           const fallbackReport: NLCReport = {
            id: 'fallback-report',
            header: { nlcNo: 'ERR', region: '', areaPastor: '', leaderName: 'Local Mode', coLeader: '', leaderPhone: '', year: '2026' },
            members: [],
            updates: CATEGORIES.map(cat => ({ category: cat, q1: '', q2: '', q3: '', q4: '' })),
          };
          setNlcReports([fallbackReport]);
          setSelectedReportId(fallbackReport.id);
        }
      } finally {
        setIsFirebaseLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isFirebaseLoading || nlcReports.length === 0) return;
    const dataToSave = { nlcReports, selectedReportId, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, "app_data", FIREBASE_DOC_ID);
        await setDoc(docRef, dataToSave, { merge: true });
        setSaveStatus('saved');
      } catch (e: any) {
        console.error("Cloud Save error:", e.code, e.message);
        if (e.code === 'permission-denied') {
          setSaveStatus('permission-denied');
        } else {
          setSaveStatus('error');
        }
      }
    }, 1500); 
    return () => clearTimeout(timer);
  }, [nlcReports, selectedReportId, isFirebaseLoading]);

  const currentReport = useMemo(() => {
    return nlcReports.find(report => report.id === selectedReportId) || null;
  }, [nlcReports, selectedReportId]);

  const handleSelectReport = useCallback((id: string) => {
    setSelectedReportId(id || null);
    setAiResult(null);
  }, []);

  const handleAddReport = useCallback(() => {
    const newReportId = Math.random().toString(36).substr(2, 9);
    const newReport: NLCReport = {
      id: newReportId,
      header: {
        nlcNo: (nlcReports.length + 1).toString().padStart(3, '0'),
        region: '',
        areaPastor: '',
        leaderName: 'New Leader',
        coLeader: '',
        leaderPhone: '',
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
    if (!id) return;
    if (window.confirm('Delete this report? This action is permanent.')) {
      setNlcReports(prev => {
        const filtered = prev.filter(r => r.id !== id);
        if (selectedReportId === id) {
          setSelectedReportId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
      setAiResult(null);
    }
  }, [selectedReportId]);

  const handleHeaderChange = useCallback((data: GroupHeaderData) => {
    if (!selectedReportId) return;
    setNlcReports(prev => prev.map(r => r.id === selectedReportId ? { ...r, header: data } : r));
  }, [selectedReportId]);

  const handleMembersUpdate = useCallback((data: Member[]) => {
    if (!selectedReportId) return;
    setNlcReports(prev => prev.map(r => r.id === selectedReportId ? { ...r, members: data } : r));
  }, [selectedReportId]);

  const handleUpdatesUpdate = useCallback((data: QuarterlyUpdate[]) => {
    if (!selectedReportId) return;
    setNlcReports(prev => prev.map(r => r.id === selectedReportId ? { ...r, updates: data } : r));
  }, [selectedReportId]);

  const handleAnalyze = async () => {
    if (!currentReport) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeReport(currentReport.header, currentReport.members, currentReport.updates);
      setAiResult(result);
    } catch (e) {
      setAiResult("Analysis failed. Please try again later.");
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 transition-all font-sans text-slate-900">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          body { background: white !important; font-size: 9pt !important; color: black !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; padding: 0 !important; margin: 0 !important; }
          .print-hidden { display: none !important; }
          .main-ledger-container { border: 1.5pt solid #000 !important; padding: 0 !important; margin: 0 auto !important; border-radius: 0 !important; width: 287mm !important; box-shadow: none !important; overflow: visible !important; }
          .print-grid-layout { display: grid !important; grid-template-columns: 28% 72% !important; gap: 0 !important; border-top: 2pt solid #000 !important; page-break-inside: avoid; min-height: 120mm; }
          .print-col { border-right: 1.5pt solid #000 !important; padding: 6pt !important; overflow: visible !important; }
          .print-col:last-child { border-right: none !important; }
          table, th, td { border: 1pt solid black !important; }
          .bg-slate-900 { background-color: #000 !important; color: #fff !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
          input, select, textarea { border: none !important; background: transparent !important; font-size: 9pt !important; color: #000 !important; padding: 0 !important; font-weight: bold !important; box-shadow: none !important; outline: none !important; appearance: none !important; }
          textarea { height: auto !important; min-height: 0 !important; overflow: visible !important; white-space: pre-wrap !important; display: block !important; }
          .doc-id-header { display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 2.5pt solid #000 !important; padding: 8pt 12pt !important; margin-bottom: 0 !important; background-color: #fff !important; }
          .print-cat-cell { background-color: #f1f5f9 !important; font-weight: 900 !important; text-transform: uppercase !important; }
          .animate-in { animation: none !important; }
        }
        @media screen { .doc-id-header { display: none; } }
      `}</style>

      <div className="max-w-[1920px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 px-4 print-hidden">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-950 rounded-xl flex items-center justify-center text-white shadow-xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none uppercase">NLC Leadership Tracker v2.0</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase transition-all flex items-center gap-1 ${
                  saveStatus === 'saved' ? 'bg-green-100 text-green-700' : 
                  saveStatus === 'saving' ? 'bg-amber-100 text-amber-700 animate-pulse' : 
                  'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-green-500' : saveStatus === 'saving' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  {saveStatus === 'saved' ? 'Cloud Synced' : 
                   saveStatus === 'saving' ? 'Syncing...' : 
                   'Offline Mode'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  Resilient Ledger Management
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()} 
              disabled={!currentReport} 
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl border border-indigo-700 font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-30 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print A4 PDF
            </button>
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !currentReport}
              className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-30 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
              {isAnalyzing ? 'Analyzing...' : 'AI Audit'}
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button onClick={handleAddReport} className="bg-white text-slate-900 border border-slate-200 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95">Add Report</button>
          </div>
        </header>

        <div className="main-ledger-container bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 lg:p-10 space-y-10 relative overflow-hidden min-h-[700px] print:p-0 print:border-black">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-950 print:hidden"></div>
          
          <div className="doc-id-header">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-black rounded-lg text-xl">NLC</div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter uppercase leading-none">Leadership Performance Tracker</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Official Institutional Record • Confidential</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="bg-slate-900 text-white px-4 py-1.5 rounded-sm font-black text-xs uppercase tracking-widest mb-2 print:bg-white print:text-black print:border-2 print:border-black">
                ID: {currentReport?.header.nlcNo || '---'}
              </div>
              <div className="text-[10px] font-black uppercase text-slate-400 print:text-black">
                Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="report-manager-container print:hidden">
            <NLCReportManager
              reports={nlcReports}
              selectedReportId={selectedReportId}
              onSelectReport={handleSelectReport}
              onAddReport={handleAddReport}
              onDeleteReport={handleDeleteReport}
            />
          </div>

          {isFirebaseLoading && nlcReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-950 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Ledger System...</p>
            </div>
          ) : currentReport ? (
            <div key={selectedReportId} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="print:px-10 print:py-6">
                <GroupHeader data={currentReport.header} onChange={handleHeaderChange} isEnabled={true} />
              </div>
              
              {aiResult && (
                <div className="ai-insights-box bg-indigo-50/40 border-l-4 border-indigo-950 p-6 rounded-r-2xl mt-8 shadow-inner print:mt-4 print:mx-10 print:border-l-2 print:border-black print:bg-slate-50 print:rounded-none">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-950 rounded-lg text-white print:bg-black">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      </div>
                      <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.3em] print:text-black">AI Assessment Insights</h3>
                    </div>
                  </div>
                  <div className="prose prose-sm prose-indigo max-w-none text-slate-700 leading-relaxed font-medium print:text-black print:text-[10pt]">
                    {aiResult}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-10 print-grid-layout">
                <div className="lg:col-span-4 h-full print-col">
                  <MembersTable members={currentReport.members} onUpdate={handleMembersUpdate} isEnabled={true} />
                </div>
                <div className="lg:col-span-8 h-full print-col">
                  <QuarterlyMetrics updates={currentReport.updates} onUpdate={handleUpdatesUpdate} isEnabled={true} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 print:hidden">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border border-slate-100">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-xl font-black uppercase tracking-widest text-slate-400">Ledger Inactive</p>
            </div>
          )}
        </div>

        <footer className="mt-8 mb-10 text-center space-y-2 print-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">NLC Leadership Tracker • Professional A4 Document Format</p>
          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 uppercase">
            <span>© {new Date().getFullYear()} Official Leadership Ledger</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Landscape PDF Optimization Engine Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
