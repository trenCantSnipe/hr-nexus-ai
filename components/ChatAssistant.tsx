import React, { useState, useRef, useEffect } from 'react';
import { chatWithGrounding } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, MapPin, Search, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: 'model',
        text: 'Hello! I am your HR Assistant. I can help with research, finding locations, or answering policy questions. I have access to Google Search and Maps.',
        timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  useEffect(() => {
    // Attempt to get location for Maps grounding
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log("Location access denied or error", err)
        );
    }
  }, []);

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
        const result = await chatWithGrounding(history, userMsg.text, location);
        
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: result.text || "I couldn't find an answer to that.",
            timestamp: new Date(),
            groundingMetadata: result.groundingMetadata
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Sorry, I encountered an error processing your request.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bot className="text-blue-500" /> HR Assistant
            </h2>
            {location && (
                <div className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <MapPin size={10} /> Location Active
                </div>
            )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                            <div className="prose prose-sm max-w-none text-inherit mb-2">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                            
                            {/* Grounding Chips */}
                            {!isUser && msg.groundingMetadata && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.groundingMetadata.search?.map((link, idx) => (
                                        <a key={`search-${idx}`} href={link.uri} target="_blank" rel="noopener noreferrer" 
                                           className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition border border-slate-200">
                                            <Search size={10} /> {link.title}
                                        </a>
                                    ))}
                                    {msg.groundingMetadata.maps?.map((link, idx) => (
                                        <a key={`map-${idx}`} href={link.uri} target="_blank" rel="noopener noreferrer" 
                                           className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-md transition border border-green-200">
                                            <MapPin size={10} /> {link.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                            
                            <p className={`text-[10px] mt-2 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSend} className="flex gap-2 relative">
                <input 
                    type="text" 
                    className="flex-1 border border-slate-300 rounded-full px-5 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-12 shadow-sm"
                    placeholder="Ask about labor laws, salary benchmarks, or lunch places..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    </div>
  );
};

export default ChatAssistant;
