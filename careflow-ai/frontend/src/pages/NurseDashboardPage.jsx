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
  Heart,
  Activity,
  FileText,
  AlertCircle,
  TrendingUp,
  Loader2,
  BellRing,
  ClipboardCheck,
  FolderOpen
} from 'lucide-react';
import { dashboardApi, taskApi } from '../services/api';
import { TaskStatusBadge, FollowUpStatusBadge, PriorityBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const NurseDashboardPage = () => {
  const { user } = useAuth();
  const nurseName = user?.name || 'Nurse Sarah';
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await dashboardApi.getNurse(nurseName);
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load nurse dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [nurseName]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}`);
      fetchMetrics();
    } catch (err) {
      showToast('Failed to update task status.');
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
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading Nurse Workstation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Nurse Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 rounded-2xl p-6 text-white shadow-xl border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <Heart className="w-4 h-4" />
            <span>Nurse Care Coordination Station</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {nurseName}</h1>
          <p className="text-emerald-200 text-sm mt-1 max-w-2xl">
            Execute bedside care workflows, update task execution statuses in real time, and coordinate patient follow-ups.
          </p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all shrink-0"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>My Task Queue</span>
        </Link>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Patients</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600"><Users className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-teal-700 tracking-tight">{metrics?.totalPatients || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Under your care queue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertCircle className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tracking-tight">{metrics?.pendingTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Requires your action</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{metrics?.inProgressTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Currently being executed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">{metrics?.completedTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Fulfilled by nurse</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Follow-ups</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><CalendarClock className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight">{metrics?.followUpsToday || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Patient appointments</p>
        </div>
      </div>

      {/* 5. Workflow Alerts Card */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Section 5: Workflow Alerts & Status Triggers</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              CBC lab order for Ravi Kumar (P-1001) is active. Please collect blood sample and mark task <strong>IN PROGRESS</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1 bg-amber-200 text-amber-800 rounded-full">
            Action Required Today
          </span>
        </div>
      </div>

      {/* 2. My Tasks Section (Primary Nurse Focus) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <span>Section 2: My Assigned Tasks Queue</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Update task status as you complete care procedures (persists to PostgreSQL)</p>
          </div>
          <Link to="/tasks" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View Full Task List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Task</th>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status (Update)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!metrics?.pendingTaskList || metrics.pendingTaskList.length === 0) ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400 text-xs">
                    No tasks currently assigned to {nurseName}.
                  </td>
                </tr>
              ) : (
                metrics.pendingTaskList.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">{task.title}</span>
                      {task.description && <div className="text-xs font-normal text-slate-500 mt-0.5">{task.description}</div>}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">{task.patientName}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{task.department}</td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs font-bold bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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

      {/* 1. Assigned Patients & 3. Upcoming Follow-ups & 4. Patient Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Assigned Patients (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Section 1: Assigned Patients (Nurse View)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Patients linked to your current task queue</p>
            </div>
            <Link to="/patients" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <span>All Patients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(!metrics?.recentPatients || metrics.recentPatients.length === 0) ? (
              <p className="px-5 py-8 text-center text-slate-400 text-xs">No assigned patients in queue.</p>
            ) : (
              metrics.recentPatients.map((p) => (
                <div key={p.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 font-bold text-sm flex items-center justify-center border border-teal-100">
                      {p.name ? p.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <Link to={`/patients/${p.id}`} className="font-semibold text-slate-900 hover:text-teal-600 text-sm transition-colors">
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium text-slate-700">{p.patientCode}</span>
                        <span>•</span>
                        <span>{p.age} yrs, {p.gender}</span>
                        <span>•</span>
                        <span>Physician: {p.doctor}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/patients/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>View Patient Record</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Upcoming Follow-ups & 4. Quick Actions */}
        <div className="space-y-8">
          
          {/* 3. Upcoming Follow-ups */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-rose-500" />
                <span>Section 3: Patient Follow-ups</span>
              </h3>
              <Link to="/follow-ups" className="text-xs font-semibold text-teal-600 hover:text-teal-700">View All</Link>
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
                      <span>Physician: {f.doctor}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. Patient Information Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Section 4: Patient Info & Documents</span>
            </h4>
            <p className="text-xs text-slate-500">
              Access clinical summaries, uploaded lab results, and patient timelines.
            </p>
            <div className="space-y-2 pt-1">
              <Link
                to="/documents"
                className="w-full p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-100 text-teal-800 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>View Clinical Documents</span>
              </Link>
              <Link
                to="/patients/1"
                className="w-full p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-800 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>Ravi Kumar (P-1001) Timeline</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
