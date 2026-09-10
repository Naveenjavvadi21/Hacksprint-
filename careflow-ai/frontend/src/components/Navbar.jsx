import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Sparkles, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'Admin Organization Dashboard';
    if (path === '/doctor/dashboard') return 'Doctor Clinical Workstation';
    if (path === '/nurse/dashboard') return 'Nurse Care Coordination Station';
    if (path === '/admin/staff') return 'Staff & Role Management';
    if (path === '/admin/ai-activity') return 'CareFlow AI Processing Log';
    if (path === '/admin/settings') return 'System Configuration & Security';
    if (path === '/dashboard') return 'Care Workflow Dashboard';
    if (path.startsWith('/patients')) return 'Patient Care Records';
    if (path === '/tasks') return 'Task Management Dashboard';
    if (path === '/documents') return 'Clinical Documents Repository';
    if (path === '/follow-ups') return 'Care Coordination Follow-ups';
    if (path === '/ai-assistant') return 'CareFlow AI Assistant';
    return 'Care Coordination';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between ml-64 shadow-xs">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{getPageTitle()}</h2>
        <span className="hidden md:inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL Live</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* AI Quick Banner */}
        <div className="hidden lg:flex items-center gap-2 bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg border border-purple-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>AI Engine Ready (Mock Service)</span>
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500"></span>
        </button>

        {/* User Role Badge */}
        <div className="text-right hidden sm:block border-l border-slate-200 pl-4">
          <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
          <p className="text-[11px] text-slate-500">{user?.role} Access</p>
        </div>
      </div>
    </header>
  );
};
