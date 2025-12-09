
import React, { useState, useRef, useEffect } from 'react';
import { Task, DirectMessage } from '../types';
import { CheckCircle2, Circle, Calendar, Clock, Send, Target, AlertTriangle, Loader2, ChevronDown, MessageCircle, User, Maximize2, Minimize2, FileText, MessageSquare } from 'lucide-react';

interface EmployeePortalProps {
  employeeId: string;
  tasks: Task[];
  messages: DirectMessage[];
  onSendMessage: (text: string, employeeId: string, sender: 'EMPLOYEE', isReport: boolean, targetsMet?: boolean) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ employeeId, tasks, messages, onSendMessage, onUpdateTaskStatus }) => {
  const [activeTab, setActiveTab] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [workDone, setWorkDone] = useState('');
  const [targetsMet, setTargetsMet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View State for Maximize/Minimize
  const [maximizedView, setMaximizedView] = useState<'none' | 'tasks' | 'chat'>('none');
  
  // Input Mode: 'chat' or 'report'
  const [inputMode, setInputMode] = useState<'chat' | 'report'>('chat');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredTasks = tasks.filter(t => t.period === activeTab);
  
  // Filter messages for this employee
  const myMessages = messages.filter(m => m.employeeId === employeeId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) return;
    
    setIsSubmitting(true);
    
    const isReport = inputMode === 'report';
    const finalTargetsMet = isReport ? targetsMet : undefined;

    // Simulate network delay
    setTimeout(() => {
        onSendMessage(workDone, employeeId, 'EMPLOYEE', isReport, finalTargetsMet);
        setIsSubmitting(false);
        setWorkDone('');
        // Reset targets met if it was a report, keep mode
        if (isReport) setTargetsMet(false);
    }, 500);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [myMessages, maximizedView]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed': 
        return {
          icon: <CheckCircle2 size={24} />,
          wrapperClass: 'bg-emerald-100 text-emerald-600 border-emerald-200',
          cardBorder: 'border-emerald-200 hover:border-emerald-300',
          textClass: 'text-slate-400 line-through decoration-slate-300'
        };
      case 'In Progress': 
        return {
          icon: <Loader2 size={24} className="animate-spin" />,
          wrapperClass: 'bg-blue-100 text-blue-600 border-blue-200',
          cardBorder: 'border-blue-200 hover:border-blue-300',
          textClass: 'text-slate-800'
        };
      default: 
        return {
          icon: <Circle size={24} />,
          wrapperClass: 'bg-slate-100 text-slate-400 border-slate-200',
          cardBorder: 'border-slate-200 hover:border-slate-300',
          textClass: 'text-slate-800'
        };
    }
  };

  return (
    <div className="p-8 h-full overflow-hidden bg-slate-50 relative flex flex-col">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">My Workspace</h2>
          <p className="text-slate-500">Track your progress and report to management.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {employeeId}
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">Logged In As</p>
                <p className="text-sm font-semibold text-slate-800">Employee #{employeeId}</p>
            </div>
        </div>
      </header>

      <div className={`grid gap-8 flex-1 min-h-0 transition-all duration-300 ${
          maximizedView === 'none' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        
        {/* Left Column: Tasks */}
        {(maximizedView === 'none' || maximizedView === 'tasks') && (
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300 ${maximizedView === 'tasks' ? 'col-span-1' : ''}`}>
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-500"/> Assigned Tasks
                    </h3>
                    <div className="flex items-center gap-2">
                        {maximizedView === 'tasks' ? (
                            <div className="flex bg-slate-200 p-1 rounded-lg">
                                {['Day', 'Week', 'Month'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        
                        <button 
                            onClick={() => setMaximizedView(maximizedView === 'tasks' ? 'none' : 'tasks')}
                            className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                            title={maximizedView === 'tasks' ? "Minimize" : "Maximize"}
                        >
                            {maximizedView === 'tasks' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {maximizedView === 'none' && (
                     <div className="px-4 py-2 border-b border-slate-100 flex justify-center bg-white shrink-0">
                        <div className="flex bg-slate-100 p-1 rounded-lg w-full">
                            {['Day', 'Week', 'Month'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                                        activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                     </div>
                )}

                <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 italic">
                            No tasks assigned for this period.
                        </div>
                    ) : (
                        filteredTasks.map(task => {
                            const styles = getStatusStyles(task.status);
                            return (
                                <div key={task.id} className={`p-4 border rounded-xl bg-white transition-all duration-200 hover:shadow-md ${styles.cardBorder}`}>
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className={`p-3 rounded-full border shrink-0 ${styles.wrapperClass}`}>
                                            {styles.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`font-semibold text-lg truncate pr-2 ${styles.textClass}`}>
                                                    {task.title}
                                                </h4>
                                                
                                                {/* Status Dropdown */}
                                                <div className="relative group/status shrink-0">
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                                                            task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500' :
                                                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                                            'bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-400 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60">
                                                        <ChevronDown size={12} />
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-500 leading-relaxed mb-3">
                                                {task.description}
                                            </p>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                                                    task.period === 'Day' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    task.period === 'Week' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                    {task.period} Goal
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

        {/* Right Column: Work Log Chat */}
        {(maximizedView === 'none' || maximizedView === 'chat') && (
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden transition-all duration-300 ${maximizedView === 'chat' ? 'col-span-1' : ''}`}>
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <MessageCircle size={18} className="text-green-500"/> Direct Message Admin
                    </h3>
                    <button 
                        onClick={() => setMaximizedView(maximizedView === 'chat' ? 'none' : 'chat')}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                        title={maximizedView === 'chat' ? "Minimize" : "Maximize"}
                    >
                        {maximizedView === 'chat' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 custom-scrollbar">
                    {myMessages.length === 0 && (
                        <div className="text-center text-slate-400 py-10">
                            <p className="text-sm">No messages yet.</p>
                            <p className="text-xs mt-1">Start describing your work below.</p>
                        </div>
                    )}
                    {myMessages.map((msg, idx) => {
                        const isMe = msg.sender === 'EMPLOYEE';
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
                                 <div className={`p-3 rounded-2xl max-w-[90%] shadow-sm ${
                                     isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                 }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                 </div>
                                 <div className="flex items-center gap-2 mt-1 px-1">
                                    {isMe && msg.isReport && msg.targetsMet !== undefined && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                            msg.targetsMet ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                            {msg.targetsMet ? 'Targets Met' : 'Targets Missed'}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400">
                                        {msg.sender === 'ADMIN' ? 'Admin • ' : ''}
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                 </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                    <div className="flex gap-2 mb-3">
                        <button 
                            type="button"
                            onClick={() => setInputMode('chat')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-md flex items-center justify-center gap-2 transition-all ${
                                inputMode === 'chat' 
                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' 
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            <MessageSquare size={12}/> Quick Chat
                        </button>
                        <button 
                            type="button"
                            onClick={() => setInputMode('report')}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-md flex items-center justify-center gap-2 transition-all ${
                                inputMode === 'report' 
                                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            <FileText size={12}/> Report Work
                        </button>
                    </div>

                    <form onSubmit={handleSendMessage} className="space-y-3">
                        <textarea 
                            required
                            className="w-full h-24 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm bg-slate-50 focus:bg-white transition-colors"
                            placeholder={inputMode === 'chat' ? "Type a message to admin..." : "Describe the work you completed today..."}
                            value={workDone}
                            onChange={(e) => setWorkDone(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />

                        <div className="flex items-center justify-between">
                            {inputMode === 'report' ? (
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${targetsMet ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>
                                        {targetsMet && <Target size={14} />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={targetsMet}
                                        onChange={(e) => setTargetsMet(e.target.checked)}
                                    />
                                    <span>Targets Met?</span>
                                </label>
                            ) : (
                                <span className="text-xs text-slate-400 italic">Chat Mode</span>
                            )}

                            <button 
                                type="submit" 
                                disabled={isSubmitting || !workDone.trim()}
                                className={`${
                                    inputMode === 'report' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                                } text-white px-5 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
                                {inputMode === 'report' ? 'Submit Report' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;
