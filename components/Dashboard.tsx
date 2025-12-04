import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_EMPLOYEES, MOCK_CANDIDATES } from '../constants';
import { Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const deptData = MOCK_EMPLOYEES.reduce((acc: any, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(deptData).map(dept => ({
    name: dept,
    count: deptData[dept]
  }));

  const stats = [
    { title: 'Total Employees', value: MOCK_EMPLOYEES.length, icon: Users, color: 'bg-blue-500' },
    { title: 'Open Roles', value: MOCK_CANDIDATES.length, icon: Calendar, color: 'bg-green-500' },
    { title: 'Pending Reviews', value: 3, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Overview</h2>
        <p className="text-slate-500">Welcome back to your HR Command Center.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className={`${stat.color} p-4 rounded-lg text-white`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                </div>
            )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Headcount by Department</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981'][index % 3]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
             <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Activity</h3>
             <ul className="space-y-4">
                <li className="flex items-start space-x-3 pb-4 border-b border-slate-50">
                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">New application received</p>
                        <p className="text-xs text-slate-500">David Lee applied for Backend Engineer</p>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">2h ago</span>
                </li>
                <li className="flex items-start space-x-3 pb-4 border-b border-slate-50">
                    <div className="h-2 w-2 mt-2 rounded-full bg-purple-500"></div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">Interview Scheduled</p>
                        <p className="text-xs text-slate-500">Technical Round with Eva Green</p>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">5h ago</span>
                </li>
                 <li className="flex items-start space-x-3">
                    <div className="h-2 w-2 mt-2 rounded-full bg-green-500"></div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">Performance Cycle Started</p>
                        <p className="text-xs text-slate-500">Q3 Review period is now active</p>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">1d ago</span>
                </li>
             </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
