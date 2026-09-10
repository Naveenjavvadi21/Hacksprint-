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
  Lock,
  X,
  AlertCircle
} from 'lucide-react';
import { dashboardApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminStaffPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'DOCTOR' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchStaffData = async () => {
    try {
      const res = await dashboardApi.getAdmin();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await authApi.register({
        name: newStaff.name.trim(),
        email: newStaff.email.trim().toLowerCase(),
        password: newStaff.password,
        role: newStaff.role,
      });

      setFormSuccess(`Successfully registered ${newStaff.name} (${newStaff.role})!`);
      setNewStaff({ name: '', email: '', password: '', role: 'DOCTOR' });
      setShowModal(false);
      await fetchStaffData();
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create staff account. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

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

        <button
          onClick={() => {
            setFormError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {formSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{formSuccess}</span>
        </div>
      )}

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

      {/* Add Staff Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add New Staff Member</h3>
                  <p className="text-xs text-slate-500">Create credentials for clinical or administrative personnel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Patel or Nurse James"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email / Username
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya@careflow.ai"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Hashed securely in the database with BCrypt.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Role & Portal Access
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="DOCTOR">DOCTOR — Clinical Diagnostics, AI & Patients</option>
                  <option value="NURSE">NURSE — Bedside Care & Task Execution</option>
                  <option value="ADMIN">ADMIN — System Administration & Staff Management</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
