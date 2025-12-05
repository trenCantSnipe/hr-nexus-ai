
import React, { useMemo, useState } from 'react';
import { DailyReport } from '../types';
import { CheckCircle2, XCircle, FileText, Clock, User, Calendar, Search } from 'lucide-react';

interface AdminReportsProps {
  reports: DailyReport[];
}

const AdminReports: React.FC<AdminReportsProps> = ({ reports }) => {
  const [filterText, setFilterText] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter(r => 
      r.employeeName.toLowerCase().includes(filterText.toLowerCase()) ||
      r.content.toLowerCase().includes(filterText.toLowerCase())
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [reports, filterText]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Task Completions</h2>
            <p className="text-slate-500 mt-1">Review daily work reports from employees.</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </header>

        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FileText size={32} />
            </div>
            <p className="text-slate-500 font-medium">No reports found.</p>
            <p className="text-sm text-slate-400">Wait for employees to submit their daily tasks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow animate-slide-down">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {report.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {report.employeeName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {report.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {report.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    report.targetsMet 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {report.targetsMet ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {report.targetsMet ? 'Targets Met' : 'Targets Missed'}
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {report.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
