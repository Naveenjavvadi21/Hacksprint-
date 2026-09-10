import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loginUser } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'NURSE' || role === 'STAFF') return '/nurse/dashboard';
    return '/doctor/dashboard';
  };

  // If user is already authenticated, redirect to their role dashboard
  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email: identifier.trim(), password });
      loginUser(response.data);
      const targetPath = getDashboardPath(response.data.user?.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Invalid username or password.');
      } else {
        setError(err.response?.data?.message || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
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
          <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Sign In</h2>
              <p className="text-xs text-slate-400">Enter your credentials to access your portal</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBAC Protected</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-xl p-3.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></div>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          CareFlow AI Secure Authentication • Spring Boot REST API
        </div>
      </div>
    </div>
  );
};
