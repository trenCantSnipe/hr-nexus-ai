
import React from 'react';
import { ViewState, UserRole } from '../types';
import { LayoutDashboard, Users, FileText, Mic, MessageSquare, ClipboardCheck, Briefcase, LogOut, Terminal, ClipboardList } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  userRole: UserRole;
  onLogout: () => void;
  notificationCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole, onLogout, notificationCount = 0 }) => {
  
  const adminItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.ADMIN_REPORTS, label: 'Daily Reports', icon: ClipboardList, hasNotification: true },
    { id: ViewState.RECRUITMENT, label: 'Recruitment', icon: Users },
    { id: ViewState.PERFORMANCE, label: 'Performance', icon: FileText },
    { id: ViewState.AUDIT, label: 'Audit & Compliance', icon: ClipboardCheck },
    { id: ViewState.CHAT_ASSISTANT, label: 'HR Assistant', icon: MessageSquare },
    { id: ViewState.ADMIN_ASSISTANT, label: 'AI Admin Tools', icon: Terminal },
    { id: ViewState.LIVE_VOICE, label: 'Voice Mode', icon: Mic },
  ];

  const employeeItems = [
    { id: ViewState.EMPLOYEE_PORTAL, label: 'My Workspace', icon: Briefcase },
  ];

  const menuItems = userRole === 'ADMIN' ? adminItems : employeeItems;

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
          // @ts-ignore - checking for custom property
          const showBadge = item.hasNotification && notificationCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
              {showBadge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                    {notificationCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-4">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-sm font-medium">Logged in as</p>
          <p className="text-xs text-slate-400 capitalize">{userRole.toLowerCase()}</p>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
