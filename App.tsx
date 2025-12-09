
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Recruitment from './components/Recruitment';
import Performance from './components/Performance';
import Audit from './components/Audit';
import ChatAssistant from './components/ChatAssistant';
import LiveAssistant from './components/LiveAssistant';
import Login from './components/Login';
import EmployeePortal from './components/EmployeePortal';
import AdminAssistant from './components/AdminAssistant';
import AdminMessages from './components/AdminMessages';
import { ViewState, UserRole, Task, DirectMessage } from './types';
import { MOCK_TASKS, MOCK_REPORTS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Lifted state for tasks so Admin can modify and Employee can view
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  
  // Shared state for Direct Messages (replaces daily reports)
  const [messages, setMessages] = useState<DirectMessage[]>(
      MOCK_REPORTS.map(r => ({
          id: r.id,
          employeeId: '1', // Defaulting mock reports to Employee 1 for demo
          sender: 'EMPLOYEE',
          text: r.content,
          timestamp: r.timestamp,
          isReport: true,
          targetsMet: r.targetsMet
      }))
  );
  
  // Notification state for Admin
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const handleLogin = (role: UserRole, employeeId?: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
    if (role === 'EMPLOYEE') {
      setCurrentEmployeeId(employeeId);
      setCurrentView(ViewState.EMPLOYEE_PORTAL);
    } else {
      setCurrentView(ViewState.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('ADMIN'); // Reset to default safely
    setCurrentEmployeeId(undefined);
    setUnreadMessageCount(0);
  };

  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    // Clear notifications if Admin views the messages
    if (view === ViewState.ADMIN_MESSAGES) {
      setUnreadMessageCount(0);
    }
  };

  const handleAddTask = (taskData: { title: string; description: string; period: 'Day' | 'Week' | 'Month'; status?: string }) => {
    const newTask: Task = {
      title: taskData.title,
      description: taskData.description,
      period: taskData.period,
      status: (taskData.status as any) || 'Not Started',
      id: Math.random().toString(36).substr(2, 9),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleBroadcastEmail = (subject: string, body: string) => {
    // Simulate email broadcast
    console.log(`Sending email to all employees.\nSubject: ${subject}\nBody: ${body}`);
  };

  const handleSendMessage = (text: string, employeeId: string, sender: 'ADMIN' | 'EMPLOYEE', isReport: boolean, targetsMet?: boolean) => {
    const newMessage: DirectMessage = {
        id: Date.now().toString(),
        employeeId: employeeId,
        sender: sender,
        text: text,
        timestamp: new Date(),
        isReport: isReport,
        targetsMet: targetsMet
    };
    
    setMessages(prev => [...prev, newMessage]);

    // If Employee sends, notify Admin
    if (sender === 'EMPLOYEE') {
        setUnreadMessageCount(prev => prev + 1);
    }
  };

  const renderContent = () => {
    if (userRole === 'EMPLOYEE') {
       return (
         <EmployeePortal 
           key={currentEmployeeId}
           employeeId={currentEmployeeId || '0'}
           tasks={tasks} 
           messages={messages}
           onSendMessage={handleSendMessage}
           onUpdateTaskStatus={handleUpdateTaskStatus}
         />
       );
    }

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
      case ViewState.ADMIN_ASSISTANT:
        return (
          <AdminAssistant 
            onAddTask={handleAddTask} 
            onBroadcastEmail={handleBroadcastEmail} 
            onSendMessage={(empId, msg) => handleSendMessage(msg, empId, 'ADMIN', false)}
          />
        );
      case ViewState.ADMIN_MESSAGES:
        return (
            <AdminMessages 
                messages={messages} 
                onSendMessage={(empId, msg) => handleSendMessage(msg, empId, 'ADMIN', false)}
            />
        );
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setView={handleViewChange} 
        userRole={userRole} 
        onLogout={handleLogout}
        notificationCount={unreadMessageCount}
      />
      <main className="flex-1 h-full relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
