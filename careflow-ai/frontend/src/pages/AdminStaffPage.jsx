import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  UserCog, 
  Stethoscope, 
  Heart, 
  ClipboardList, 
  Shield, 
  ArrowLeft,
  UserPlus,
  Mail,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminStaffPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getAdmin().then((res) => {
      setMetrics(res.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-600" />
            <span>Staff & Role Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage clinical staff accounts, permissions, and department affiliations.</p>
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Staff</span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalStaff || 5}</div>
          <p className="text-xs text-slate-400 mt-1">Active system accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Doctors</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{metrics?.doctorCount || 1}</div>
          <p className="text-xs text-slate-400 mt-1">Clinical decision makers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Nurses & Care Staff</span>
            <Heart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{metrics?.nurseCount || 1}</div>
          <p className="text-xs text-slate-400 mt-1">Bedside & task execution</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Healthcare Personnel Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified user accounts authenticated with JWT & BCrypt password hashing</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Staff Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Access Scope</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(metrics?.staffList || [
                { id: 1, name: 'Dr. Rao', email: 'doctor@careflow.ai', role: 'DOCTOR' },
                { id: 2, name: 'Nurse Sarah', email: 'nurse@careflow.ai', role: 'NURSE' },
                { id: 3, name: 'System Admin', email: 'admin@careflow.ai', role: 'ADMIN' },
                { id: 4, name: 'Alex Taylor', email: 'coordinator@careflow.ai', role: 'COORDINATOR' },
                { id: 5, name: 'Lab Staff', email: 'staff@careflow.ai', role: 'STAFF' },
              ]).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs">
                      {s.name.charAt(0)}
                    </div>
                    <span>{s.name}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-mono text-xs">{s.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      s.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      s.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                      s.role === 'NURSE' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{s.role}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {s.role === 'ADMIN' ? 'Full Control' : s.role === 'DOCTOR' ? 'Clinical AI & Patients' : s.role === 'NURSE' ? 'Task Queue & Care' : 'Follow-up Management'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
