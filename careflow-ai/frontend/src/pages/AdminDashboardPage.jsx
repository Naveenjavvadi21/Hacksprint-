import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  CheckCircle2,
  CalendarClock,
  Sparkles,
  ArrowUpRight,
  Clock,
  ArrowRight,
  Shield,
  Stethoscope,
  Heart,
  Activity,
  Building2,
  UserCog,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  FileText,
  Settings,
  BarChart3,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  Search
} from 'lucide-react';
import { dashboardApi, taskApi, patientApi, documentApi } from '../services/api';
import { TaskStatusBadge, FollowUpStatusBadge, PriorityBadge } from '../components/StatusBadge';
import { AIBadge } from '../components/AIBadge';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await dashboardApi.getAdmin();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}`);
      fetchMetrics();
    } catch (err) {
      showToast('Failed to update task status.');
    }
  };

  const handleAssigneeChange = async (taskId, newAssignee) => {
    try {
      await taskApi.updateAssignee(taskId, { assignedTo: newAssignee });
      showToast(`Task reassigned to ${newAssignee}`);
      fetchMetrics();
    } catch (err) {
      showToast('Failed to reassign task.');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading Admin Control Center...</p>
        </div>
      </div>
    );
  }

  const filteredTasks = (metrics?.pendingTaskList || []).filter(t => {
    if (taskFilter === 'PENDING') return t.status === 'PENDING';
    if (taskFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  }).filter(t => {
    if (!searchQuery) return true;
    return t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.department.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Workflow Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Complete executive visibility across all clinical departments, staff assignments, task execution, and AI activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/admin/staff"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
          >
            <UserCog className="w-4 h-4" />
            <span>Staff Directory</span>
          </Link>
          <Link
            to="/admin/ai-activity"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Activity Log</span>
          </Link>
        </div>
      </div>

      {/* 1. Top Metrics (Organization-Wide) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Patients</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600"><Users className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics?.totalPatients || 0}</div>
          <p className="text-xs text-slate-500 mt-1">All registered patients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Staff</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><UserCog className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">{metrics?.totalStaff || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Active team members</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><CheckSquare className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tracking-tight">{metrics?.pendingTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Across all departments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{metrics?.inProgressTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Active workflows</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">{metrics?.completedTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Organization-wide</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Analyses</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><Sparkles className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-purple-600 tracking-tight">{metrics?.aiAnalysesCount || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Processed documents</p>
        </div>
      </div>

      {/* 2. Staff Overview Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <span>Section 2: Staff Overview & Role Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Active medical and administrative personnel across the healthcare network</p>
          </div>
          <Link to="/admin/staff" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <span>Manage Staff & Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><Stethoscope className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-extrabold text-blue-700">{metrics?.doctorCount || 0}</p>
              <p className="text-xs text-blue-800 font-semibold">Active Doctors</p>
              <p className="text-[11px] text-blue-600">Clinical decision makers</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><Heart className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-700">{metrics?.nurseCount || 0}</p>
              <p className="text-xs text-emerald-800 font-semibold">Active Nurses</p>
              <p className="text-[11px] text-emerald-600">Task execution & bedside care</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><Shield className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-extrabold text-purple-700">{metrics?.staffList?.filter(s => s.role === 'ADMIN').length || 1}</p>
              <p className="text-xs text-purple-800 font-semibold">Administrators</p>
              <p className="text-[11px] text-purple-600">Full system access</p>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        {metrics?.staffList && metrics.staffList.length > 0 && (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metrics.staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        s.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        s.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                        s.role === 'NURSE' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>{s.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {s.role === 'ADMIN' ? 'Full Organization Access' : s.role === 'DOCTOR' ? 'Clinical Workflow & AI' : 'Task Queue & Care'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Task Monitoring Section (With Reassign & Status Control) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sky-500" />
              <span>Section 3: Task Monitoring & Reassignment</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Admin can monitor, filter, change status, and reassign tasks across all departments</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  className={`px-3 py-1 rounded-md transition-colors ${taskFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            <Link to="/tasks" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Task</th>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Assigned Staff</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                    No tasks match the filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">{task.title}</span>
                      {task.description && <div className="text-xs font-normal text-slate-500 mt-0.5">{task.description}</div>}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">{task.patientName}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{task.department}</td>
                    <td className="px-5 py-4">
                      {/* Reassign dropdown */}
                      <select
                        value={task.assignedTo || 'Unassigned'}
                        onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                        className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                      >
                        <option value="Dr. Rao">Dr. Rao (Doctor)</option>
                        <option value="Dr. Patel">Dr. Patel (Doctor)</option>
                        <option value="Nurse Sarah">Nurse Sarah (Nurse)</option>
                        <option value="Alex Taylor">Alex Taylor (Coordinator)</option>
                        <option value="Lab Tech">Lab Tech (Staff)</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Patient Overview & 5. AI Activity & 6. Follow-up Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 4. Patient Overview (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-500" />
                  <span>Section 4: Patient Overview</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">All active care records in the healthcare facility</p>
              </div>
              <Link to="/patients" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {metrics?.recentPatients?.map((p) => (
                <div key={p.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 font-bold text-sm flex items-center justify-center border border-sky-100">
                      {p.name ? p.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <Link to={`/patients/${p.id}`} className="font-semibold text-slate-900 hover:text-sky-600 text-sm transition-colors">
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium text-slate-700">{p.patientCode}</span>
                        <span>•</span>
                        <span>{p.age} yrs, {p.gender}</span>
                        <span>•</span>
                        <span>Doctor: {p.doctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.workflowStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {p.workflowStatus}
                    </span>
                    <Link
                      to={`/patients/${p.id}`}
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Open Patient Workflow"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 5. AI Activity & 6. Follow-up Overview */}
        <div className="space-y-8">
          
          {/* 5. AI Activity Overview */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl space-y-4 border border-purple-800">
            <div className="flex items-center justify-between">
              <AIBadge text="AI Monitor" />
              <span className="text-xs text-purple-300 font-mono">Live Engine</span>
            </div>
            <h4 className="font-bold text-lg leading-snug">Section 5: AI Activity & Processing</h4>
            <div className="space-y-2 text-xs text-purple-200">
              <div className="flex justify-between py-1 border-b border-purple-800/50">
                <span>Total Documents Analyzed:</span>
                <strong className="text-white">{metrics?.aiAnalysesCount || 0}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-purple-800/50">
                <span>Auto-extracted Tasks:</span>
                <strong className="text-white">Active in DB</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Action Accuracy:</span>
                <strong className="text-emerald-400">100% Mock Validated</strong>
              </div>
            </div>
            <Link
              to="/admin/ai-activity"
              className="w-full py-2.5 px-4 bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Open AI Activity Log</span>
            </Link>
          </div>

          {/* 6. Follow-up Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-rose-500" />
                <span>Section 6: Follow-up Overview</span>
              </h3>
              <Link to="/follow-ups" className="text-xs font-semibold text-sky-600 hover:text-sky-700">View All</Link>
            </div>

            <div className="space-y-3">
              {(!metrics?.upcomingFollowUps || metrics.upcomingFollowUps.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming follow-ups scheduled.</p>
              ) : (
                metrics.upcomingFollowUps.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{f.patientName}</p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{f.type}</p>
                      </div>
                      <FollowUpStatusBadge status={f.status} />
                    </div>
                    <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {f.scheduledDate}
                      </span>
                      <span>Doctor: {f.doctor}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
