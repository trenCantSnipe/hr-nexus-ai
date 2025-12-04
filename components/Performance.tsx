import React, { useState } from 'react';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee } from '../types';
import { FileText, BrainCircuit, Volume2, Loader2 } from 'lucide-react';
import { generatePerformanceReview, generateSpeech } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Performance: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(MOCK_EMPLOYEES[0]);
  const [review, setReview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerateReview = async () => {
    setIsGenerating(true);
    setReview('');
    try {
      const result = await generatePerformanceReview(
        selectedEmployee.name,
        selectedEmployee.role,
        selectedEmployee.performanceLog
      );
      setReview(result || 'Failed to generate review.');
    } catch (e) {
      setReview('Error generating review.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReadAloud = async () => {
    if (!review) return;
    setIsPlaying(true);
    try {
      const audioBuffer = await generateSpeech(review.substring(0, 500)); // Limit for demo
      if (audioBuffer) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await ctx.decodeAudioData(audioBuffer);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        source.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Performance Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee List */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-700">Employees</div>
             <div className="divide-y divide-slate-100">
               {MOCK_EMPLOYEES.map(emp => (
                 <div 
                    key={emp.id} 
                    onClick={() => { setSelectedEmployee(emp); setReview(''); }}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition ${selectedEmployee.id === emp.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                 >
                    <p className="font-semibold text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.role}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Review Generator */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{selectedEmployee.name}</h3>
                        <p className="text-slate-500 text-sm">Performance Logs (Q3)</p>
                    </div>
                    <button 
                        onClick={handleGenerateReview}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-70"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                        <span>Deep Think Review</span>
                    </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {selectedEmployee.performanceLog.map((log, i) => (
                            <li key={i}>{log}</li>
                        ))}
                    </ul>
                </div>

                {review && (
                    <div className="animate-fade-in border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                <FileText size={18} className="text-blue-500"/>
                                Generated Evaluation
                             </h4>
                             <button 
                                onClick={handleReadAloud}
                                disabled={isPlaying}
                                className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm transition"
                             >
                                <Volume2 size={16} />
                                {isPlaying ? 'Playing...' : 'Read Aloud'}
                             </button>
                        </div>
                        <div className="prose prose-sm max-w-none text-slate-700">
                            <ReactMarkdown>{review}</ReactMarkdown>
                        </div>
                    </div>
                )}
                
                {isGenerating && (
                    <div className="py-12 text-center text-slate-400">
                        <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-400"/>
                        <p>Analysing performance data with Gemini Deep Thinking...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
