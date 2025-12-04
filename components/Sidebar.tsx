import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, FileText, Mic, MessageSquare, ClipboardCheck } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.RECRUITMENT, label: 'Recruitment', icon: Users },
    { id: ViewState.PERFORMANCE, label: 'Performance', icon: FileText },
    { id: ViewState.AUDIT, label: 'Audit & Compliance', icon: ClipboardCheck },
    { id: ViewState.CHAT_ASSISTANT, label: 'HR Assistant', icon: MessageSquare },
    { id: ViewState.LIVE_VOICE, label: 'Voice Mode', icon: Mic },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          HR Nexus AI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Powered by Gemini</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-sm font-medium">Logged in as</p>
          <p className="text-xs text-slate-400">Admin User</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
