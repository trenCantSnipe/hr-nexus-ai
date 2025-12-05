import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, User, Briefcase } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'ADMIN' && password === '123') {
      onLogin('ADMIN');
    } else if (role === 'EMPLOYEE' && password === '456') {
      onLogin('EMPLOYEE');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            HR Nexus AI
          </h1>
          <p className="text-slate-500 mt-2">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setPassword(''); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === 'ADMIN' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} /> Admin
            </button>
            <button
              type="button"
              onClick={() => { setRole('EMPLOYEE'); setPassword(''); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === 'EMPLOYEE' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase size={16} /> Employee
            </button>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={role === 'ADMIN' ? "Enter '123'" : "Enter '456'"}
              />
            </div>
            {error && <p className="text-red-500 text-xs pl-1">{error}</p>}
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-transform active:scale-[0.98] ${
                role === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Sign In as {role === 'ADMIN' ? 'Admin' : 'Employee'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Secure Enterprise Login • Gemini Powered
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;