
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Calendar, Clock, Send, Target, AlertTriangle, Loader2, ChevronDown, MessageCircle, User } from 'lucide-react';

interface EmployeePortalProps {
  employeeId: string;
  tasks: Task[];
  onSubmitReport: (content: string, targetsMet: boolean) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ employeeId, tasks, onSubmitReport, onUpdateTaskStatus }) => {
  const [activeTab, setActiveTab] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [workDone, setWorkDone] = useState('');
  const [targetsMet, setTargetsMet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local history for the chat session
  const [sessionMessages, setSessionMessages] = useState<{text: string, time: Date, targets: boolean}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredTasks = tasks.filter(t => t.period === activeTab);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay and sending to chat
    setTimeout(() => {
        onSubmitReport(workDone, targetsMet);
        
        // Add to local chat history
        setSessionMessages(prev => [...prev, {
            text: workDone,
            time: new Date(),
            targets: targetsMet
        }]);

        setIsSubmitting(false);
        setWorkDone('');
        // We keep targetsMet as is, or reset if preferred. Let's keep it for context.
    }, 500);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages]);

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
    <div className="p-8 h-full overflow-y-auto bg-slate-50 relative">
      <header className="mb-8 flex justify-between items-end">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100%-100px)]">
        
        {/* Left Column: Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500"/> Assigned Tasks
                </h3>
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
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
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

        {/* Right Column: Work Log Chat */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <MessageCircle size={18} className="text-green-500"/> Daily Work Chat
                </h3>
                <p className="text-xs text-slate-500 mt-1">Send updates to Admin in real-time.</p>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {sessionMessages.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        <p className="text-sm">No updates sent today.</p>
                        <p className="text-xs mt-1">Start describing your work below.</p>
                    </div>
                )}
                {sessionMessages.map((msg, idx) => (
                    <div key={idx} className="flex flex-col items-end animate-slide-up">
                         <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[90%] shadow-sm">
                            <p className="text-sm">{msg.text}</p>
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                            {msg.targets && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
                                    Targets Met
                                </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                                {msg.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                         </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea 
                        required
                        className="w-full h-24 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm bg-slate-50 focus:bg-white transition-colors"
                        placeholder="Describe your daily work done..."
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

                        <button 
                            type="submit" 
                            disabled={isSubmitting || !workDone.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
