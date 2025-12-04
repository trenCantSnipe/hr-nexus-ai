import React, { useState } from 'react';
import { generateAuditReport } from '../services/geminiService';
import { ShieldCheck, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Audit: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setReport('');
    try {
      const result = await generateAuditReport(inputText);
      setReport(result || "No issues found.");
    } catch (e) {
      setReport("Error generating audit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <ShieldCheck className="text-emerald-600" />
        Compliance & Audit
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col h-[600px]">
             <label className="font-medium text-slate-700 mb-2">Policy / Document Text</label>
             <textarea 
                className="flex-1 w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white font-mono text-sm"
                placeholder="Paste company policy, email thread, or document text here to audit for compliance risks, bias, or clarity issues..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
             />
             <button 
                onClick={handleAudit}
                disabled={loading || !inputText}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition flex justify-center items-center gap-2 disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                Run Compliance Audit
             </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-[600px] overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-slate-500"/> Audit Findings
            </h3>
            {loading && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 size={32} className="animate-spin mb-2"/>
                    <p>Scanning text...</p>
                </div>
            )}
            {!loading && !report && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <p>No audit generated yet.</p>
                </div>
            )}
            {report && (
                <div className="prose prose-sm max-w-none text-slate-700">
                    <ReactMarkdown>{report}</ReactMarkdown>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Audit;
