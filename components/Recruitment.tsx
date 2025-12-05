
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_CANDIDATES, MOCK_INTERVIEWS } from '../constants';
import { Candidate, Interview } from '../types';
import { Calendar, Clock, User, Sparkles, Mail, Send, X, CheckCircle2, Search, Filter, ArrowUpDown, Bold, Italic, Link as LinkIcon, List, Paperclip, Mic, Play, Square, Award, MessageSquare, Volume2, ArrowRight, Loader2, Users, Wand2, CalendarCheck, StickyNote, Save } from 'lucide-react';
import { generateInterviewQuestions, analyzeCandidateResponse, generateSpeech, draftRecruitmentEmail, suggestInterviewTime } from '../services/geminiService';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Applied': return 'bg-blue-100 text-blue-700';
        case 'Screening': return 'bg-amber-100 text-amber-700';
        case 'Interview': return 'bg-purple-100 text-purple-700';
        case 'Offer': return 'bg-emerald-100 text-emerald-700';
        case 'Rejected': return 'bg-rose-100 text-rose-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const Recruitment: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [interviews, setInterviews] = useState<Interview[]>(MOCK_INTERVIEWS);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // Filter & Sort State
  const [searchRole, setSearchRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Interview Filter State
  const [filterInterviewType, setFilterInterviewType] = useState<string>('All');

  // Simple scheduling mock state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Auto-Scheduling State
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [autoScheduleProposal, setAutoScheduleProposal] = useState<{date: string, time: string, reason: string} | null>(null);

  // Email state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailBcc, setEmailBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  // AI Interviewer State
  const [interviewMode, setInterviewMode] = useState<'idle' | 'active' | 'feedback' | 'summary'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{rating: number, feedback: string, improvements: string[]} | null>(null);
  const [transcript, setTranscript] = useState<{question: string, answer: string, analysis: any}[]>([]);

  // Notes State
  const [noteInput, setNoteInput] = useState('');

  // Reset email form, interview & notes when candidate changes
  useEffect(() => {
    setShowEmailForm(false);
    setEmailSubject('');
    setEmailBody('');
    setEmailCc('');
    setEmailBcc('');
    setShowCcBcc(false);
    setGeneratedQuestions([]);
    setScheduleDate('');
    setScheduleTime('');
    setAutoScheduleProposal(null);
    resetInterviewSession();
    
    // Set notes
    setNoteInput(selectedCandidate?.notes || '');
  }, [selectedCandidate]);

  const resetInterviewSession = () => {
      setInterviewMode('idle');
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setIsRecording(false);
      setIsAnalyzing(false);
      setAnalysisResult(null);
      setTranscript([]);
  };

  // Filter & Sort Logic
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(c => {
        const matchesRole = c.role.toLowerCase().includes(searchRole.toLowerCase());
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
        return matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else {
          comparison = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [candidates, searchRole, filterStatus, sortBy, sortOrder]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => filterInterviewType === 'All' || i.type === filterInterviewType);
  }, [interviews, filterInterviewType]);

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

  const startInterview = () => {
    if (generatedQuestions.length === 0) return;
    setInterviewMode('active');
    setCurrentQuestionIndex(0);
    setTranscript([]);
    setCurrentAnswer('');
  };

  const handleSpeechInput = () => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setCurrentAnswer(prev => prev ? `${prev} ${text}` : text);
        };
        recognition.onerror = (e: any) => {
            console.error("Speech error", e);
            setIsRecording(false);
        };
        recognition.start();
    } else {
        alert("Voice input is not supported in this browser. Please type your answer.");
    }
  };

  const playQuestionAudio = async () => {
    if (!generatedQuestions[currentQuestionIndex]) return;
    setIsPlayingAudio(true);
    try {
        const audioBuffer = await generateSpeech(generatedQuestions[currentQuestionIndex]);
        if (audioBuffer) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buffer = await ctx.decodeAudioData(audioBuffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            source.onended = () => setIsPlayingAudio(false);
        }
    } catch(e) {
        console.error(e);
        setIsPlayingAudio(false);
    }
  };

  const submitAnswer = async () => {
      if (!currentAnswer.trim() || !selectedCandidate) return;
      setIsAnalyzing(true);
      
      const question = generatedQuestions[currentQuestionIndex];
      const result = await analyzeCandidateResponse(selectedCandidate.role, question, currentAnswer);
      
      setAnalysisResult(result);
      setIsAnalyzing(false);
      setInterviewMode('feedback');
  };

  const nextQuestion = () => {
      // Save to transcript
      if (analysisResult) {
          setTranscript(prev => [...prev, {
              question: generatedQuestions[currentQuestionIndex],
              answer: currentAnswer,
              analysis: analysisResult
          }]);
      }

      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < generatedQuestions.length) {
          setCurrentQuestionIndex(nextIdx);
          setCurrentAnswer('');
          setAnalysisResult(null);
          setInterviewMode('active');
      } else {
          setInterviewMode('summary');
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
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleAutoSchedule = async () => {
      if (!selectedCandidate) return;
      setIsAutoScheduling(true);
      setAutoScheduleProposal(null);
      try {
          const proposal = await suggestInterviewTime(selectedCandidate.name, selectedCandidate.role);
          setAutoScheduleProposal(proposal);
      } catch (e) {
          alert("Could not generate a schedule proposal. Please try again.");
      } finally {
          setIsAutoScheduling(false);
      }
  };

  const confirmAutoSchedule = () => {
      if (!selectedCandidate || !autoScheduleProposal) return;
      const newInterview: Interview = {
          id: Math.random().toString(36).substr(2, 9),
          candidateId: selectedCandidate.id,
          date: autoScheduleProposal.date,
          time: autoScheduleProposal.time,
          interviewer: 'AI Scheduler',
          type: 'Technical'
      };
      setInterviews([...interviews, newInterview]);
      alert(`✅ Confirmed: Interview with ${selectedCandidate.name} on ${autoScheduleProposal.date} at ${autoScheduleProposal.time}`);
      setAutoScheduleProposal(null);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsSendingEmail(true);
    
    // Simulate network request
    setTimeout(() => {
        setIsSendingEmail(false);
        setShowEmailForm(false);
        const ccMsg = emailCc ? `\nCC: ${emailCc}` : '';
        const bccMsg = emailBcc ? `\nBCC: ${emailBcc}` : '';
        alert(`Email sent successfully to ${selectedCandidate.email}${ccMsg}${bccMsg}\nSubject: ${emailSubject}`);
        setEmailSubject('');
        setEmailBody('');
        setEmailCc('');
        setEmailBcc('');
        setShowCcBcc(false);
    }, 1500);
  };

  const handleSendToAll = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
        alert("Please enter a subject and body before sending.");
        return;
    }
    
    if (filteredCandidates.length === 0) {
        alert("No candidates in the current list to email.");
        return;
    }

    if (!window.confirm(`Are you sure you want to send this email to all ${filteredCandidates.length} candidates in the current list?`)) {
        return;
    }

    setIsSendingEmail(true);
    
    // Simulate bulk sending
    setTimeout(() => {
        setIsSendingEmail(false);
        setShowEmailForm(false);
        alert(`Bulk email sent successfully to ${filteredCandidates.length} candidates.\nSubject: ${emailSubject}`);
        setEmailSubject('');
        setEmailBody('');
        setEmailCc('');
        setEmailBcc('');
        setShowCcBcc(false);
    }, 2000);
  };

  const handleAiDraft = async () => {
    if (!selectedCandidate) return;
    setIsDraftingEmail(true);
    try {
        const draft = await draftRecruitmentEmail(
            selectedCandidate.name, 
            selectedCandidate.role, 
            selectedCandidate.status
        );
        setEmailSubject(draft.subject);
        setEmailBody(draft.body);
    } catch (error) {
        console.error(error);
        alert("Failed to auto-draft email.");
    } finally {
        setIsDraftingEmail(false);
    }
  };

  const triggerAutomatedEmail = (candidate: Candidate, status: string) => {
      const isOffer = status === 'Offer';
      const subject = isOffer 
          ? `Offer of Employment: ${candidate.role} at HR Nexus AI`
          : `Update on your application for ${candidate.role}`;
      
      // Simulate automated backend process
      setTimeout(() => {
          alert(`🤖 AUTOMATION TRIGGERED\n\nStatus changed to: ${status}\nAutomated email sent to: ${candidate.email}\nSubject: "${subject}"`);
      }, 500);
  };

  const handleStatusChange = (newStatus: string) => {
      if (!selectedCandidate) return;

      const updatedCandidates = candidates.map(c => 
          c.id === selectedCandidate.id ? { ...c, status: newStatus as any } : c
      );
      setCandidates(updatedCandidates);
      
      const updatedSelected = { ...selectedCandidate, status: newStatus as any };
      setSelectedCandidate(updatedSelected);

      if (newStatus === 'Offer' || newStatus === 'Rejected') {
          triggerAutomatedEmail(updatedSelected, newStatus);
      }
  };

  const handleSaveNote = () => {
      if(!selectedCandidate) return;
      const updatedCandidates = candidates.map(c => 
          c.id === selectedCandidate.id ? { ...c, notes: noteInput } : c
      );
      setCandidates(updatedCandidates);
      setSelectedCandidate({ ...selectedCandidate, notes: noteInput });
      alert("Notes updated successfully.");
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Recruitment</h2>
            <p className="text-slate-500 mt-1">Manage pipeline and schedule interviews</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
            <User size={18} />
            Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100%-100px)]">
        {/* Candidate List - Spans 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 flex justify-between items-center">
                <span>Candidates</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{filteredCandidates.length}</span>
            </div>

            {/* Filter & Sort Toolbar */}
            <div className="p-3 bg-white border-b border-slate-100 space-y-3">
                {/* Search Role */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Filter by role..." 
                        className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                    />
                     {searchRole && (
                        <button 
                            onClick={() => setSearchRole('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
                
                {/* Status & Sort */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select 
                            className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Applied">Applied</option>
                            <option value="Screening">Screening</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                             <Filter size={12} />
                        </div>
                    </div>

                    <div className="relative flex-1">
                         <select 
                            className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [key, order] = e.target.value.split('-');
                                setSortBy(key as 'name'|'date');
                                setSortOrder(order as 'asc'|'desc');
                            }}
                        >
                            <option value="date-desc">Newest</option>
                            <option value="date-asc">Oldest</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                             <ArrowUpDown size={12} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                <div className="divide-y divide-slate-100">
                    {filteredCandidates.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No candidates match your filters.
                        </div>
                    ) : (
                        filteredCandidates.map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => setSelectedCandidate(c)}
                                className={`p-4 hover:bg-slate-50 transition cursor-pointer border-l-4 ${selectedCandidate?.id === c.id ? 'bg-blue-50/50 border-blue-500' : 'border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold ${selectedCandidate?.id === c.id ? 'text-blue-700' : 'text-slate-800'}`}>{c.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getStatusColor(c.status)}`}>
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-1">{c.role}</p>
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span className="truncate max-w-[120px]">{c.experience}</span>
                                    <span>{new Date(c.appliedDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Center/Right Panel - Spans 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Scheduled Interviews Header */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 shrink-0">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-500"/> Upcoming Schedule
                    </h3>
                    <div className="flex items-center gap-2">
                         <select
                            className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-600 outline-none focus:border-blue-500 cursor-pointer"
                            value={filterInterviewType}
                            onChange={(e) => setFilterInterviewType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Technical">Technical</option>
                            <option value="Behavioral">Behavioral</option>
                            <option value="Screening">Screening</option>
                        </select>
                    </div>
                </div>
                
                {filteredInterviews.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No interviews found.</p>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {filteredInterviews.map(i => {
                            const candidate = candidates.find(c => c.id === i.candidateId);
                            return (
                                <div key={i.id} className="min-w-[200px] p-3 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{candidate?.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <Clock size={12}/> {i.date} • {i.time}
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                                        {i.type}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Selected Candidate Actions */}
            {selectedCandidate ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col animate-fade-in relative overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{selectedCandidate.name}</h2>
                            <p className="text-slate-500">{selectedCandidate.role}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><Mail size={14} /> {selectedCandidate.email}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> Applied: {new Date(selectedCandidate.appliedDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</span>
                             <div className="relative">
                                <select
                                    value={selectedCandidate.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-sm font-bold border-none outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 transition-colors ${getStatusColor(selectedCandidate.status)}`}
                                >
                                    <option value="Applied">Applied</option>
                                    <option value="Screening">Screening</option>
                                    <option value="Interview">Interview</option>
                                    <option value="Offer">Offer</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        {/* Action Toolbar */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                             <button
                                onClick={() => setShowEmailForm(!showEmailForm)}
                                className={`py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border
                                ${showEmailForm 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                            >
                                {showEmailForm ? <X size={18} /> : <Mail size={18} />}
                                {showEmailForm ? 'Cancel Email' : 'Email Candidate'}
                            </button>
                             <button 
                                onClick={() => handleGenerateQuestions(selectedCandidate)}
                                disabled={isLoadingQuestions}
                                className={`py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border 
                                ${generatedQuestions.length > 0 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                                    : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'} disabled:opacity-50`}
                            >
                                {isLoadingQuestions ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                                {isLoadingQuestions ? 'Thinking...' : generatedQuestions.length > 0 ? 'Regenerate Questions' : 'AI Interview Prep'}
                            </button>
                        </div>

                        {/* Interactive Mode & Email Form & Scheduler Switcher */}
                        {showEmailForm ? (
                             <div className="mb-8 bg-white p-0 rounded-xl border border-slate-200 shadow-lg animate-slide-down relative overflow-hidden group">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <Send size={16} className="text-blue-600"/> Compose Message
                                    </h4>
                                    <div className="flex gap-2 items-center">
                                         <button 
                                            onClick={handleAiDraft} 
                                            disabled={isDraftingEmail}
                                            className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold px-3 py-1.5 rounded-md transition flex items-center gap-1 disabled:opacity-50"
                                         >
                                            {isDraftingEmail ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                            AI Auto-Draft
                                         </button>
                                         <div className="h-4 w-px bg-slate-300 mx-1"></div>
                                         <button onClick={() => setShowCcBcc(!showCcBcc)} className="text-xs text-slate-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-slate-200 transition">
                                            CC/BCC
                                         </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                         <span className="text-sm font-medium text-slate-500 w-12">To:</span>
                                         <span className="text-sm text-slate-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedCandidate.email}</span>
                                    </div>
                                    {showCcBcc && (
                                        <div className="animate-fade-in space-y-2 border-b border-slate-100 pb-2">
                                            <div className="flex items-center gap-3">
                                                 <span className="text-sm font-medium text-slate-500 w-12">Cc:</span>
                                                 <input type="text" className="flex-1 text-sm outline-none placeholder:text-slate-300" placeholder="cc@example.com" value={emailCc} onChange={e => setEmailCc(e.target.value)} />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 <span className="text-sm font-medium text-slate-500 w-12">Bcc:</span>
                                                 <input type="text" className="flex-1 text-sm outline-none placeholder:text-slate-300" placeholder="bcc@example.com" value={emailBcc} onChange={e => setEmailBcc(e.target.value)} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                         <span className="text-sm font-medium text-slate-500 w-12">Subject:</span>
                                         <input type="text" placeholder="Subject line..." className="flex-1 text-sm outline-none font-medium text-slate-800 placeholder:text-slate-300" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required />
                                    </div>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
                                            <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"><Bold size={14}/></button>
                                            <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"><Italic size={14}/></button>
                                            <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                            <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"><LinkIcon size={14}/></button>
                                            <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded"><List size={14}/></button>
                                            <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded ml-auto"><Paperclip size={14}/></button>
                                        </div>
                                        <textarea placeholder="Write your message here..." rows={8} className="w-full px-4 py-3 text-sm text-slate-700 outline-none resize-none" value={emailBody} onChange={e => setEmailBody(e.target.value)} required />
                                        <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 flex justify-end">
                                            <span className="text-[10px] text-slate-400">{emailBody.length} characters</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <button 
                                            type="button"
                                            onClick={handleSendToAll}
                                            disabled={isSendingEmail || filteredCandidates.length === 0}
                                            className="text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-2"
                                        >
                                            <Users size={14} /> Send to All ({filteredCandidates.length})
                                        </button>
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setShowEmailForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Discard</button>
                                            <button type="submit" disabled={isSendingEmail} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-70">
                                                {isSendingEmail ? 'Sending...' : <>Send Email <Send size={14} /></>}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : interviewMode !== 'idle' ? (
                            // --- AI INTERVIEW INTERFACE ---
                            <div className="bg-white rounded-xl border border-indigo-100 shadow-lg flex flex-col h-[500px] overflow-hidden">
                                {interviewMode === 'summary' ? (
                                    <div className="p-8 flex flex-col items-center justify-center h-full space-y-6">
                                        <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                                            <Award size={48} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800">Interview Session Complete</h3>
                                        <p className="text-slate-500 text-center max-w-md">You've completed {transcript.length} questions. Review the transcripts in your notes or start a new session.</p>
                                        <button onClick={resetInterviewSession} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
                                            Finish Session
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-slate-100 w-full">
                                            <div 
                                                className="h-full bg-indigo-500 transition-all duration-500" 
                                                style={{ width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%` }} 
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                            {/* Question Card */}
                                            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question {currentQuestionIndex + 1} of {generatedQuestions.length}</span>
                                                    <button 
                                                        onClick={playQuestionAudio}
                                                        disabled={isPlayingAudio}
                                                        className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition"
                                                    >
                                                        {isPlayingAudio ? <Volume2 className="animate-pulse"/> : <Play size={20} className="fill-current"/>}
                                                    </button>
                                                </div>
                                                <h3 className="text-xl font-medium text-indigo-900 leading-relaxed">
                                                    {generatedQuestions[currentQuestionIndex]}
                                                </h3>
                                            </div>

                                            {/* Feedback View (if available) */}
                                            {interviewMode === 'feedback' && analysisResult && (
                                                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl animate-fade-in space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={18} className="text-emerald-600"/>
                                                        <span className="font-bold text-emerald-800">AI Analysis</span>
                                                        <span className="ml-auto bg-white px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 text-emerald-700">
                                                            Score: {analysisResult.rating}/10
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-emerald-800">{analysisResult.feedback}</p>
                                                    {analysisResult.improvements.length > 0 && (
                                                        <ul className="list-disc list-inside text-xs text-emerald-700 space-y-1 mt-2">
                                                            {analysisResult.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}

                                            {/* Input Area */}
                                            {interviewMode === 'active' && (
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <textarea 
                                                            className="w-full p-4 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white min-h-[120px]"
                                                            placeholder="Type your answer or use the microphone..."
                                                            value={currentAnswer}
                                                            onChange={e => setCurrentAnswer(e.target.value)}
                                                        />
                                                        <button 
                                                            onClick={handleSpeechInput}
                                                            className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            {isRecording ? <Square size={16} fill="currentColor"/> : <Mic size={18}/>}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                            {interviewMode === 'active' ? (
                                                <button 
                                                    onClick={submitAnswer}
                                                    disabled={isAnalyzing || !currentAnswer.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {isAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <MessageSquare size={18}/>}
                                                    {isAnalyzing ? 'Analyzing Response...' : 'Submit Answer'}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={nextQuestion}
                                                    className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2"
                                                >
                                                    Next Question <ArrowRight size={18}/>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            // --- DEFAULT VIEW: QUESTIONS LIST & SCHEDULER & NOTES ---
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {/* Questions Display */}
                                {generatedQuestions.length > 0 && (
                                    <div className="col-span-1 md:col-span-2 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                                                <Sparkles size={16} className="text-indigo-600"/> Interview Prep
                                            </h4>
                                            <button 
                                                onClick={startInterview}
                                                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm flex items-center gap-1"
                                            >
                                                <Mic size={12}/> Start Interactive Mode
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {generatedQuestions.map((q, i) => (
                                                <div key={i} className="flex gap-3 text-slate-700 bg-white p-3 rounded-lg border border-indigo-100/50 shadow-sm">
                                                    <span className="font-bold text-indigo-500">{i+1}</span>
                                                    <p>{q}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Scheduler Form */}
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                            <Clock size={16} className="text-slate-500"/> Quick Schedule
                                        </h4>
                                        <button 
                                            onClick={handleAutoSchedule}
                                            disabled={isAutoScheduling}
                                            className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded font-medium transition flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {isAutoScheduling ? <Loader2 size={10} className="animate-spin" /> : <CalendarCheck size={12} />}
                                            Auto-Schedule with AI
                                        </button>
                                    </div>

                                    {autoScheduleProposal ? (
                                        <div className="bg-white border border-indigo-100 rounded-lg p-4 mb-4 shadow-sm animate-fade-in">
                                            <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">AI Proposal</p>
                                            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
                                                <Calendar size={16} className="text-slate-400"/> {autoScheduleProposal.date}
                                                <span className="text-slate-300">|</span>
                                                <Clock size={16} className="text-slate-400"/> {autoScheduleProposal.time}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-4 italic">"{autoScheduleProposal.reason}"</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setAutoScheduleProposal(null)} className="flex-1 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition">Decline</button>
                                                <button onClick={confirmAutoSchedule} className="flex-1 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded transition font-medium">Confirm</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleScheduleInterview} className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-500">Date</label>
                                                <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none bg-white" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-500">Time</label>
                                                <input type="time" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none bg-white" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                                            </div>
                                            <button type="submit" className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition shadow-sm flex justify-center items-center gap-2">
                                                <CheckCircle2 size={14}/> Confirm
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Private Notes Section */}
                                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 h-fit flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                                            <StickyNote size={16} className="text-yellow-600"/> Private Notes
                                        </h4>
                                    </div>
                                    <textarea 
                                        className="w-full p-3 border border-yellow-200 rounded-lg bg-yellow-50/50 text-sm text-slate-700 focus:ring-2 focus:ring-yellow-400 outline-none resize-none mb-3 placeholder:text-yellow-600/50"
                                        rows={6}
                                        placeholder="Add private observations, interview feedback, or key concerns here..."
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleSaveNote}
                                        className="self-end bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-2"
                                    >
                                        <Save size={14}/> Save Notes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <User size={32} className="text-slate-300" />
                    </div>
                    <p className="text-lg font-medium">Select a candidate</p>
                    <p className="text-sm">View details, schedule interviews, or send emails.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;