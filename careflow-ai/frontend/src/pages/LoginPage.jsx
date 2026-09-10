import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'NURSE' || role === 'STAFF') return '/nurse/dashboard';
    return '/doctor/dashboard';
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      loginUser(response.data);
      const targetPath = getDashboardPath(response.data.user?.role);
      navigate(targetPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    authApi.login({ email: demoEmail, password: 'password123' })
      .then((res) => {
        loginUser(res.data);
        const targetPath = getDashboardPath(res.data.user?.role);
        navigate(targetPath);
      })
      .catch((err) => {
        setError('Failed to authenticate demo account.');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/25 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">CareFlow <span className="text-sky-400">AI</span></h1>
        <p className="mt-2 text-sm text-slate-400">
          AI-Powered Healthcare Workflow & Care Coordination Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg p-3">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@careflow.ai"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-semibold text-slate-300">Hackathon Judge Demo Accounts (1-Click Login):</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor@careflow.ai', 'DOCTOR')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-semibold text-sky-400">Dr. Rao</div>
                <div className="text-[10px] text-slate-400">Doctor</div>
                <div className="text-[9px] text-sky-300 mt-1">/doctor/dashboard</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('nurse@careflow.ai', 'NURSE')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-semibold text-emerald-400">Nurse Sarah</div>
                <div className="text-[10px] text-slate-400">Nurse</div>
                <div className="text-[9px] text-emerald-300 mt-1">/nurse/dashboard</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@careflow.ai', 'ADMIN')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-semibold text-indigo-400">System Admin</div>
                <div className="text-[10px] text-slate-400">Admin</div>
                <div className="text-[9px] text-indigo-300 mt-1">/admin/dashboard</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Powered by Spring Boot REST API & PostgreSQL Database
        </div>
      </div>
    </div>
  );
};
