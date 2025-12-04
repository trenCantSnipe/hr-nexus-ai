import React, { useState, useEffect, useRef } from 'react';
import { LiveSession } from '../services/geminiService';
import { Mic, MicOff, Activity, X } from 'lucide-react';

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("Ready to connect");
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);

  // Visualization mock
  const [bars, setBars] = useState<number[]>([10, 20, 15, 30, 20, 10, 5, 10, 20, 15]);

  useEffect(() => {
    let interval: any;
    if (isActive) {
        interval = setInterval(() => {
            setBars(bars.map(() => Math.random() * 40 + 10));
        }, 100);
    } else {
        setBars([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.disconnect();
      setIsActive(false);
      setStatus("Disconnected");
    } else {
      setError(null);
      sessionRef.current = new LiveSession(
        (s) => setStatus(s),
        (e) => { setError(e); setIsActive(false); }
      );
      await sessionRef.current.connect();
      setIsActive(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (sessionRef.current) {
            sessionRef.current.disconnect();
        }
    }
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px]"></div>
      </div>

      <div className="z-10 text-center space-y-8 max-w-lg">
        <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2">Live Voice HR</h2>
            <p className="text-slate-300">Have a natural conversation about candidates, scheduling, or mock interviews.</p>
        </div>

        {/* Visualizer */}
        <div className="h-32 flex items-center justify-center gap-2">
            {bars.map((h, i) => (
                <div 
                    key={i} 
                    className={`w-3 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full transition-all duration-100 ease-out`}
                    style={{ height: `${h}px`, opacity: isActive ? 1 : 0.3 }}
                ></div>
            ))}
        </div>

        <div className="flex flex-col items-center gap-4">
            <p className={`text-sm font-medium ${error ? 'text-red-400' : 'text-blue-300'}`}>
                {error || status}
            </p>
            
            <button
                onClick={toggleSession}
                className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105
                    ${isActive 
                        ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-500/30' 
                        : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-600/30'}
                `}
            >
                {isActive ? <X size={32} /> : <Mic size={32} />}
            </button>
            
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-4">
                {isActive ? 'Live Session Active' : 'Tap to Speak'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default LiveAssistant;
