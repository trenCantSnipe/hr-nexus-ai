
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DirectMessage } from '../types';
import { Search, User, Send, CheckCircle2, AlertTriangle, Circle } from 'lucide-react';

interface AdminMessagesProps {
  messages: DirectMessage[];
  onSendMessage: (employeeId: string, text: string) => void;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ messages, onSendMessage }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Group messages by employee ID to build the sidebar list
  const employees = useMemo(() => {
    const employeeSet = new Set<string>();
    messages.forEach(m => employeeSet.add(m.employeeId));
    // Ensure we have at least defaults 1-20 available if they haven't messaged yet? 
    // Or just show active chats. Let's show active chats + standard 1-5 for demo.
    for(let i=1; i<=5; i++) employeeSet.add(i.toString());
    
    return Array.from(employeeSet).sort((a,b) => parseInt(a) - parseInt(b));
  }, [messages]);

  const filteredEmployees = employees.filter(id => 
    `Employee #${id}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeMessages = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return messages
        .filter(m => m.employeeId === selectedEmployeeId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [messages, selectedEmployeeId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !inputText.trim()) return;
    
    onSendMessage(selectedEmployeeId, inputText);
    setInputText('');
  };

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search employees..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredEmployees.map(empId => {
                const lastMsg = messages.filter(m => m.employeeId === empId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
                return (
                    <div 
                        key={empId}
                        onClick={() => setSelectedEmployeeId(empId)}
                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition-colors ${selectedEmployeeId === empId ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-slate-700">Employee #{empId}</h3>
                            {lastMsg && (
                                <span className="text-[10px] text-slate-400">
                                    {lastMsg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 truncate h-4">
                            {lastMsg ? lastMsg.text : <span className="italic opacity-50">No messages yet</span>}
                        </p>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {selectedEmployeeId ? (
            <>
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                            {selectedEmployeeId}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Employee #{selectedEmployeeId}</h3>
                            <p className="text-xs text-green-600 flex items-center gap-1"><Circle size={8} fill="currentColor"/> Online</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {activeMessages.length === 0 && (
                        <div className="text-center text-slate-400 py-20">
                            <p>This is the start of your conversation with Employee #{selectedEmployeeId}.</p>
                        </div>
                    )}
                    {activeMessages.map(msg => {
                        const isAdmin = msg.sender === 'ADMIN';
                        return (
                            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-fade-in`}>
                                <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                                    isAdmin 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1 px-1">
                                    {!isAdmin && msg.targetsMet !== undefined && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                            msg.targetsMet ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                            {msg.targetsMet ? 'Targets Met' : 'Targets Missed'}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400">
                                        {msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={!inputText.trim()}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <User size={32} />
                </div>
                <p>Select an employee to start messaging.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
