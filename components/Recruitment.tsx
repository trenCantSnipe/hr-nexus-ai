import React, { useState } from 'react';
import { MOCK_CANDIDATES, MOCK_INTERVIEWS } from '../constants';
import { Candidate, Interview } from '../types';
import { Calendar, CheckCircle, Clock, User, Sparkles } from 'lucide-react';
import { generateInterviewQuestions } from '../services/geminiService';

const Recruitment: React.FC = () => {
  const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [interviews, setInterviews] = useState<Interview[]>(MOCK_INTERVIEWS);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // Simple scheduling mock state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleGenerateQuestions = async (c: Candidate) => {
    setIsLoadingQuestions(true);
    setGeneratedQuestions([]);
    try {
      const questions = await generateInterviewQuestions(c.role, c.experience);
      setGeneratedQuestions(questions);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !scheduleDate || !scheduleTime) return;
    
    const newInterview: Interview = {
        id: Math.random().toString(36).substr(2, 9),
        candidateId: selectedCandidate.id,
        date: scheduleDate,
        time: scheduleTime,
        interviewer: 'Current User',
        type: 'Technical'
    };
    
    setInterviews([...interviews, newInterview]);
    alert(`Interview scheduled for ${selectedCandidate.name} on ${scheduleDate} at ${scheduleTime}`);
    // Reset
    setScheduleDate('');
    setScheduleTime('');
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Recruitment</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
            <User size={18} />
            Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">
                Active Candidates
            </div>
            <div className="divide-y divide-slate-100">
                {candidates.map(c => (
                    <div key={c.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center">
                        <div onClick={() => setSelectedCandidate(c)} className="cursor-pointer flex-1">
                            <h3 className="font-semibold text-slate-800">{c.name}</h3>
                            <p className="text-sm text-slate-500">{c.role} • {c.experience}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                ${c.status === 'Interview' ? 'bg-purple-100 text-purple-700' : 
                                  c.status === 'Applied' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {c.status}
                            </span>
                            <button 
                                onClick={() => setSelectedCandidate(c)}
                                className="text-slate-400 hover:text-blue-600"
                            >
                                Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
            {/* Scheduled Interviews */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500"/> Upcoming Interviews
                </h3>
                <div className="space-y-3">
                    {interviews.length === 0 && <p className="text-sm text-slate-400">No interviews scheduled.</p>}
                    {interviews.map(i => {
                        const candidate = candidates.find(c => c.id === i.candidateId);
                        return (
                            <div key={i.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="font-medium text-sm text-slate-800">{candidate?.name}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <Clock size={12}/> {i.date} @ {i.time}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Selected Candidate Actions */}
            {selectedCandidate && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{selectedCandidate.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{selectedCandidate.role}</p>
                    
                    {/* AI Generator */}
                    <div className="mb-6">
                        <button 
                            onClick={() => handleGenerateQuestions(selectedCandidate)}
                            disabled={isLoadingQuestions}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            <Sparkles size={16} />
                            {isLoadingQuestions ? 'Generating...' : 'Generate AI Interview Questions'}
                        </button>
                        
                        {generatedQuestions.length > 0 && (
                            <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-sm space-y-2">
                                {generatedQuestions.map((q, i) => (
                                    <p key={i} className="text-slate-700 flex gap-2">
                                        <span className="font-bold text-indigo-400">{i+1}.</span> {q}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scheduler */}
                    <form onSubmit={handleScheduleInterview} className="space-y-3 border-t border-slate-100 pt-4">
                        <p className="font-medium text-sm text-slate-700">Schedule Interview</p>
                        <input 
                            type="date" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={scheduleDate}
                            onChange={e => setScheduleDate(e.target.value)}
                        />
                        <input 
                            type="time" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={scheduleTime}
                            onChange={e => setScheduleTime(e.target.value)}
                        />
                        <button type="submit" className="w-full bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800 transition">
                            Confirm Schedule
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
