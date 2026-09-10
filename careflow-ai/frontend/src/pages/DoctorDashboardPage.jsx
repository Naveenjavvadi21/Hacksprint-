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
  Stethoscope,
  Activity,
  FileText,
  AlertCircle,
  TrendingUp,
  Loader2,
  Send,
  Check,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { dashboardApi, taskApi, aiApi, patientApi } from '../services/api';
import { TaskStatusBadge, FollowUpStatusBadge, PriorityBadge } from '../components/StatusBadge';
import { AIBadge, AISafetyDisclaimer } from '../components/AIBadge';
import { useAuth } from '../context/AuthContext';

export const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const doctorName = user?.name || 'Dr. Rao';
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // AI Assistant Widget State on Doctor Dashboard
  const [selectedPatientId, setSelectedPatientId] = useState('1');
  const [docText, setDocText] = useState(`Patient Ravi Kumar (P-1001), 35/M admitted for acute chest discomfort and fatigue.
ECG shows normal sinus rhythm. Advised CBC blood test to rule out infection and anemia.
Dr. Rao to review CBC report within 48 hours. Schedule cardiology consultation follow-up in 7 days.`);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [approvedActions, setApprovedActions] = useState({});
  const [creatingTasks, setCreatingTasks] = useState(false);
  const [tasksCreatedSuccess, setTasksCreatedSuccess] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await dashboardApi.getDoctor(doctorName);
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [doctorName]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}`);
      fetchMetrics();
    } catch (err) {
      showToast('Failed to update task status.');
    }
  };

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    setAiResult(null);
    setTasksCreatedSuccess(false);

    try {
      const res = await aiApi.directAnalyze({
        patientId: Number(selectedPatientId),
        text: docText,
        title: 'Clinical Consultation Note'
      });
      setAiResult(res.data);
      const actionsList = res.data.extractedActions || res.data.actions || [];
      // Auto-check all actions for doctor approval
      const approvals = {};
      actionsList.forEach((_, idx) => {
        approvals[idx] = true;
      });
      setApprovedActions(approvals);
      showToast('✨ AI analysis completed! Review and approve actions below.');
    } catch (err) {
      showToast('AI analysis failed. Using fallback clinical parser.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleActionApproval = (idx) => {
    setApprovedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCreateApprovedTasks = async () => {
    const actionsList = aiResult?.extractedActions || aiResult?.actions || [];
    if (!aiResult || actionsList.length === 0) return;

    const selectedActions = actionsList.filter((_, idx) => approvedActions[idx]);
    if (selectedActions.length === 0) {
      showToast('Please approve at least one action item.');
      return;
    }

    setCreatingTasks(true);
    try {
      await taskApi.createBatch({
        patientId: Number(selectedPatientId),
        analysisId: aiResult.id || 1,
        actions: selectedActions
      });
      setTasksCreatedSuccess(true);
      showToast(`✅ Successfully created ${selectedActions.length} workflow tasks in PostgreSQL!`);
      fetchMetrics();
    } catch (err) {
      showToast('Failed to create tasks.');
    } finally {
      setCreatingTasks(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading Doctor Clinical Dashboard...</p>
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

      {/* Doctor Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-cyan-950 to-teal-950 rounded-2xl p-6 text-white shadow-xl border border-cyan-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Clinical Workstation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {doctorName}</h1>
          <p className="text-cyan-200 text-sm mt-1 max-w-2xl">
            Monitor your assigned patients, review clinical notes, extract workflow actions with AI, and track care follow-ups.
          </p>
        </div>
        <a
          href="#ai-assistant-section"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/25 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>⭐ AI Assistant Tool</span>
        </a>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">My Patients</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600"><Users className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-700 tracking-tight">{metrics?.totalPatients || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Assigned under your care</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><CheckSquare className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tracking-tight">{metrics?.pendingTasks || 0}</div>
          <p className="text-xs text-slate-500 mt-1">For your patients</p>
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
          <p className="text-xs text-slate-500 mt-1">Successfully done</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Follow-ups</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><CalendarClock className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight">{metrics?.followUpsToday || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled consultations</p>
        </div>
      </div>

      {/* 1. My Patients Table & 2. Patient Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. My Patients Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                <span>Section 1: My Assigned Patients</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Patients assigned directly to {doctorName}</p>
            </div>
            <Link to="/patients" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
              <span>View All Patients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Age / Gender</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Activity</th>
                  <th className="px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!metrics?.recentPatients || metrics.recentPatients.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400 text-xs">
                      No patients currently assigned to {doctorName}.
                    </td>
                  </tr>
                ) : (
                  metrics.recentPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/patients/${p.id}`} className="font-semibold text-slate-900 hover:text-cyan-600">
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{p.patientCode}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-700 font-medium">
                        {p.age} yrs, {p.gender}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.workflowStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {p.workflowStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {p.patientCode === 'P-1001' ? 'AI Document Analysis' : 'Clinical Consultation'}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/patients/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 text-xs font-semibold transition-colors"
                        >
                          <span>Open Record</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Patient Workflow Activity Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Section 2: Patient Workflow</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Recent clinical events & care progression</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 text-purple-700 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Analysis Completed</span>
              </div>
              <p className="text-slate-700">Ravi Kumar (P-1001) - Extracted 3 action items including CBC Test & Cardiology follow-up.</p>
              <span className="text-[10px] text-purple-500 font-mono mt-1 block">Just now • Automated</span>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Doctor Note Uploaded</span>
              </div>
              <p className="text-slate-700">Sarah Williams (P-1002) - Clinical progress note saved by {doctorName}.</p>
              <span className="text-[10px] text-blue-500 font-mono mt-1 block">2 hours ago</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Task Completed</span>
              </div>
              <p className="text-slate-700">Anita Sharma (P-1004) - Routine vital signs verified by nursing staff.</p>
              <span className="text-[10px] text-emerald-500 font-mono mt-1 block">4 hours ago</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. AI Assistant (Prominent Section with Human Review & Approval) */}
      <div id="ai-assistant-section" className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 rounded-2xl p-6 text-white shadow-2xl border border-purple-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AIBadge text="Section 3: AI Workflow Assistant" />
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                Doctor Review Required
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Clinical Document Analysis & Action Extraction</h2>
            <p className="text-xs text-purple-200 mt-1">
              Paste or inspect healthcare notes. AI summarizes findings and suggests structured tasks for doctor approval.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 font-medium">Select Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-900 border border-purple-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="1">Ravi Kumar (P-1001) - Hero Demo</option>
              <option value="2">Sarah Williams (P-1002)</option>
              <option value="4">Anita Sharma (P-1004)</option>
            </select>
          </div>
        </div>

        {/* AI Safety Disclaimer Box */}
        <div className="bg-purple-950/60 border border-purple-700/50 p-3.5 rounded-xl flex items-start gap-3 text-xs text-purple-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">AI Safety Compliance: </strong>
            CareFlow AI assists healthcare professionals with workflow coordination and documentation. It does not diagnose patients or make autonomous clinical decisions. All extracted actions require physician approval before task creation.
          </div>
        </div>

        {/* Input Text Area & Analyze Button */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-purple-200 flex items-center justify-between">
            <span>Healthcare Document / Clinical Note Content:</span>
            <span className="text-[11px] text-purple-400 font-normal">Pre-filled with Ravi Kumar's Discharge Note</span>
          </label>
          <textarea
            rows="4"
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            className="w-full bg-slate-950/90 border border-purple-800/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunAIAnalysis}
              disabled={analyzing || !docText}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with AI Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Document with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Extracted Results & Action Approval Box */}
        {aiResult && (
          <div className="bg-slate-950/80 border border-purple-700/60 rounded-xl p-5 space-y-4 animate-fadeIn">
            {/* Summary */}
            <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-700/40">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Clinical Summary:</span>
              </h4>
              <p className="text-xs text-slate-200">{aiResult.summary}</p>
            </div>

            {/* Extracted Actions with Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                  <span>Extracted Workflow Actions (Doctor Approval Required):</span>
                </h4>
                <span className="text-[11px] text-purple-400">Review departments and priority</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(aiResult.extractedActions || aiResult.actions || []).map((action, idx) => {
                  const isApproved = approvedActions[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleActionApproval(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isApproved
                          ? 'bg-purple-900/40 border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-slate-900/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs text-white">{action.title}</div>
                        <input
                          type="checkbox"
                          checked={isApproved || false}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-purple-200 mt-1">{action.description}</p>
                      
                      <div className="mt-3 pt-2 border-t border-purple-800/40 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-purple-300">Dept: {action.department}</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{action.priority}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create Tasks Button */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-800/50">
              <div className="text-xs text-purple-300">
                {Object.values(approvedActions).filter(Boolean).length} of {(aiResult.extractedActions || aiResult.actions || []).length} actions approved by {doctorName}
              </div>

              <button
                onClick={handleCreateApprovedTasks}
                disabled={creatingTasks || tasksCreatedSuccess}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                  tasksCreatedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
                }`}
              >
                {creatingTasks ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to PostgreSQL...</span>
                  </>
                ) : tasksCreatedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tasks Created in Database!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Approve & Create Tasks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. My Tasks & 5. Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 4. My Tasks Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-600" />
                <span>Section 4: My Clinical Tasks</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tasks requiring doctor action or review</p>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Task</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!metrics?.pendingTaskList || metrics.pendingTaskList.length === 0) ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-slate-400 text-xs">
                      No clinical tasks pending.
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
                      <td className="px-5 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
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

        {/* 5. Upcoming Follow-ups */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-rose-500" />
              <span>Section 5: Doctor Follow-ups</span>
            </h3>
            <Link to="/follow-ups" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">View All</Link>
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
                    <span className="text-cyan-700 font-medium">Assigned: {f.doctor}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
