
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
import AdminReports from './components/AdminReports';
import { ViewState, UserRole, Task, DailyReport } from './types';
import { MOCK_TASKS, MOCK_REPORTS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Lifted state for tasks so Admin can modify and Employee can view
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  // Shared state for daily reports
  const [reports, setReports] = useState<DailyReport[]>(MOCK_REPORTS);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Set default view based on role
    if (role === 'EMPLOYEE') {
      setCurrentView(ViewState.EMPLOYEE_PORTAL);
    } else {
      setCurrentView(ViewState.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('ADMIN'); // Reset to default safely
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

  const handleReportSubmission = (content: string, targetsMet: boolean) => {
    const newReport: DailyReport = {
        id: Date.now().toString(),
        employeeName: "Current Employee", // Hardcoded for single session demo
        date: new Date().toISOString().split('T')[0],
        content: content,
        targetsMet: targetsMet,
        timestamp: new Date()
    };
    setReports(prev => [newReport, ...prev]);
  };

  const renderContent = () => {
    if (userRole === 'EMPLOYEE') {
       return (
         <EmployeePortal 
           tasks={tasks} 
           onSubmitReport={handleReportSubmission} 
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
          />
        );
      case ViewState.ADMIN_REPORTS:
        return <AdminReports reports={reports} />;
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
        setView={setCurrentView} 
        userRole={userRole} 
        onLogout={handleLogout}
      />
      <main className="flex-1 h-full relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
