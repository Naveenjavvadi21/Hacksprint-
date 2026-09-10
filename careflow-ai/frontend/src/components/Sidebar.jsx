import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  CalendarClock, 
  Sparkles, 
  LogOut, 
  Activity,
  Shield,
  Stethoscope,
  Heart,
  UserCog,
  Settings,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const role = user?.role || 'DOCTOR';

  // Role-specific navigation arrays
  let navItems = [];

  if (role === 'ADMIN') {
    navItems = [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patients', label: 'Patients', icon: Users },
      { path: '/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
      { path: '/admin/staff', label: 'Staff Management', icon: UserCog, badge: 'Admin' },
      { path: '/admin/ai-activity', label: 'AI Activity', icon: Sparkles, badge: 'AI' },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];
  } else if (role === 'DOCTOR') {
    navItems = [
      { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patients', label: 'My Patients', icon: Users },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
      { path: '/tasks', label: 'My Tasks', icon: CheckSquare },
      { path: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    ];
  } else if (role === 'NURSE' || role === 'STAFF') {
    navItems = [
      { path: '/nurse/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patients', label: 'My Patients', icon: Users },
      { path: '/tasks', label: 'My Tasks', icon: CheckSquare },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    ];
  } else {
    // Default fallback to Doctor
    navItems = [
      { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patients', label: 'My Patients', icon: Users },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
      { path: '/tasks', label: 'My Tasks', icon: CheckSquare },
      { path: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    ];
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight text-lg leading-none">CareFlow <span className="text-sky-400">AI</span></h1>
          <p className="text-[11px] text-slate-400 mt-1">Care Coordination Platform</p>
        </div>
      </div>

      {/* Role Badge Banner */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-red-400" />}
          {role === 'DOCTOR' && <Stethoscope className="w-3.5 h-3.5 text-blue-400" />}
          {(role === 'NURSE' || role === 'STAFF') && <Heart className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="text-xs font-bold text-slate-300 tracking-wider">
            {role} PORTAL
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
          role === 'DOCTOR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          Active
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {role} Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  item.badge === 'Admin' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
              <span className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800/50">
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
