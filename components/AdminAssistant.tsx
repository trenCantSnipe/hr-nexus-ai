import React, { useState, useRef, useEffect } from 'react';
import { chatWithAdminTools } from '../services/geminiService';
import { ChatMessage, Task } from '../types';
import { Send, Bot, Terminal, Loader2, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AdminAssistantProps {
  onAddTask: (task: { title: string; description: string; period: 'Day' | 'Week' | 'Month'; status?: string }) => void;
  onBroadcastEmail: (subject: string, body: string) => void;
}

const AdminAssistant: React.FC<AdminAssistantProps> = ({ onAddTask, onBroadcastEmail }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: 'model',
        text: 'Welcome, Admin. I am your AI Command Center. I can help you assign tasks to all employees or broadcast emails. You can also specify the initial status (e.g., "Assign a task In Progress"). Just ask me!',
        timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        const result = await chatWithAdminTools(history, userMsg.text);
        
        // Handle Function Calls
        let aiResponseText = result.text;
        
        if (result.functionCalls && result.functionCalls.length > 0) {
            for (const call of result.functionCalls) {
                if (call.name === 'assign_task_to_all') {
                    const args = call.args as any;
                    onAddTask({
                        title: args.title,
                        description: args.description,
                        period: args.period,
                        status: args.status
                    });
                    const statusMsg = args.status ? ` (Status: ${args.status})` : '';
                    aiResponseText = `✅ I have assigned the task "${args.title}" to all employees for this ${args.period.toLowerCase()}${statusMsg}.`;
                } else if (call.name === 'send_email_to_all') {
                    const args = call.args as any;
                    onBroadcastEmail(args.subject, args.body);
                    aiResponseText = `📧 I have broadcasted the email with subject "${args.subject}" to all employees.`;
                }
            }
        }

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: aiResponseText || "Done.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
        console.error(error);
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Sorry, I encountered an error executing that command.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 shadow-md flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
                <Terminal size={20} className="text-white" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">Admin Command Center</h2>
                <p className="text-xs text-slate-400">Automate HR operations with AI</p>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>
                            <div className="prose prose-sm prose-invert max-w-none mb-1">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                            <p className={`text-[10px] mt-2 opacity-60 text-right`}>
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                )
            })}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 rounded-bl-none flex items-center gap-2 text-slate-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs">Processing command...</span>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
            <form onSubmit={handleSend} className="flex gap-2 relative">
                <input 
                    type="text" 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-12 text-slate-100 placeholder:text-slate-500 transition-all"
                    placeholder="e.g., 'Assign a task to everyone to submit Q3 goals by Friday' or 'Email everyone about the holiday party'"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 top-2.5 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    </div>
  );
};

export default AdminAssistant;