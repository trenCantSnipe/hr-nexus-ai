import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Recruitment from './components/Recruitment';
import Performance from './components/Performance';
import Audit from './components/Audit';
import ChatAssistant from './components/ChatAssistant';
import LiveAssistant from './components/LiveAssistant';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.RECRUITMENT:
        return <Recruitment />;
      case ViewState.PERFORMANCE:
        return <Performance />;
      case ViewState.AUDIT:
        return <Audit />;
      case ViewState.CHAT_ASSISTANT:
        return <ChatAssistant />;
      case ViewState.LIVE_VOICE:
        return <LiveAssistant />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 h-full relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
