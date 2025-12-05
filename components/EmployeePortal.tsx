
import React, { useState } from 'react';
import { Task } from '../types';
import { CheckCircle2, Circle, Calendar, Clock, Send, Target, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

interface EmployeePortalProps {
  tasks: Task[];
  onSubmitReport: (content: string, targetsMet: boolean) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ tasks, onSubmitReport, onUpdateTaskStatus }) => {
  const [activeTab, setActiveTab] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [workDone, setWorkDone] = useState('');
  const [targetsMet, setTargetsMet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filteredTasks = tasks.filter(t => t.period === activeTab);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmission = () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
        onSubmitReport(workDone, targetsMet);
        setIsSubmitting(false);
        setWorkDone('');
        setTargetsMet(false);
        alert("Daily report submitted successfully to Admin.");
    }, 800);
  };

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
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">My Workspace</h2>
        <p className="text-slate-500">Track your progress and report to management.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
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

        {/* Right Column: Reporting */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
            <h3 className="font-semibold text-slate-700 mb-6 flex items-center gap-2">
                <Clock size={18} className="text-green-500"/> Daily Report Submission
            </h3>

            <form onSubmit={handleSubmitClick} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Task Completion & Work Log
                    </label>
                    <textarea 
                        required
                        className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none text-sm"
                        placeholder="Detail all work completed today. This will be sent to the admin for review..."
                        value={workDone}
                        onChange={(e) => setWorkDone(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className={`p-2 rounded-full ${targetsMet ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Target size={20} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="targets" className="text-sm font-medium text-slate-800 block cursor-pointer">
                            Daily Targets Met
                        </label>
                        <p className="text-xs text-slate-500">Check this if you completed all assigned goals.</p>
                    </div>
                    <input 
                        id="targets"
                        type="checkbox" 
                        className="w-5 h-5 accent-green-600 cursor-pointer"
                        checked={targetsMet}
                        onChange={(e) => setTargetsMet(e.target.checked)}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? 'Submitting...' : <>Submit Report <Send size={16} /></>}
                </button>
            </form>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-scale-up">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600 mx-auto">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Confirm Submission</h3>
                <p className="text-sm text-slate-500 text-center mb-6">
                    Are you sure you want to submit your daily report? This action cannot be undone and will be sent to the admin immediately.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowConfirmDialog(false)}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmSubmission}
                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
