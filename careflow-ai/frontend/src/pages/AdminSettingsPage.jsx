import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowLeft, ShieldCheck, Database, Server, Key, Bell } from 'lucide-react';

export const AdminSettingsPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <Link to="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure backend connection, database pools, and AI engine parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-500" />
            <span>Database Configuration</span>
          </h3>
          <div className="space-y-3 text-xs text-slate-600 font-mono">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-sans font-semibold text-slate-700">Database:</span>
              <span>H2 Database Engine (Embedded)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-sans font-semibold text-slate-700">Storage:</span>
              <span>./data/careflow_ai (Persistent File)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-sans font-semibold text-slate-700">Connection Pool:</span>
              <span>HikariCP (Active)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sans font-semibold text-slate-700">Status:</span>
              <span className="text-emerald-600 font-bold">CONNECTED</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500" />
            <span>Security & Authentication</span>
          </h3>
          <div className="space-y-3 text-xs text-slate-600 font-mono">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-sans font-semibold text-slate-700">Auth Mechanism:</span>
              <span>JWT (HMAC-SHA256)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-sans font-semibold text-slate-700">Password Hashing:</span>
              <span>BCrypt (10 rounds)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-sans font-semibold text-slate-700">Token Expiry:</span>
              <span>24 Hours</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sans font-semibold text-slate-700">RBAC:</span>
              <span className="text-indigo-600 font-bold">ENABLED (ADMIN, DOCTOR, NURSE)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
