import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Building2, 
  User, 
  Calendar,
  LayoutGrid,
  List,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { taskApi } from '../services/api';
import { PriorityBadge } from '../components/StatusBadge';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      const statusLabel =
        newStatus === 'IN_PROGRESS' ? 'In Progress' :
        newStatus === 'COMPLETED' ? 'Completed' : 'Pending';
      
      showToast(`Task marked as ${statusLabel}!`);
      fetchTasks();
    } catch (err) {
      showToast('Failed to update task status.');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(taskIdStr || draggedTaskId);
    if (taskId) {
      handleStatusChange(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'PENDING');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-600" />
            <span>Task Management & Care Coordination</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, drag-and-drop, and advance clinical workflow tasks extracted by CareFlow AI.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5 text-slate-600" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search task title, patient, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-xs">Loading task dashboard...</div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: PENDING */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'PENDING')}
            className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 flex flex-col min-h-[500px]"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-sm font-bold text-slate-900">Pending Actions</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {pendingTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {pendingTasks.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400 border border-dashed border-amber-200 rounded-xl p-4">
                  No pending tasks. Drag cards here to set to Pending.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {task.title}
                      </h4>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.patientName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {task.department}
                        </span>
                        <span className="font-medium text-slate-600">{task.assignedTo}</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-slate-400 pt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                        title="Start Task"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
            className="bg-sky-50/40 border border-sky-200/80 rounded-2xl p-4 flex flex-col min-h-[500px]"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-900">In Progress</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {inProgressTasks.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400 border border-dashed border-sky-200 rounded-xl p-4">
                  No tasks currently active. Drag cards here to start.
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white p-4 rounded-xl border border-sky-200 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 group ring-1 ring-sky-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {task.title}
                      </h4>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-600 space-y-1 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <User className="w-3.5 h-3.5 text-sky-500" />
                        <span>{task.patientName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {task.department}
                        </span>
                        <span className="font-medium text-slate-600">{task.assignedTo}</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-slate-400 pt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleStatusChange(task.id, 'PENDING')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                        title="Revert to Pending"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Pending</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Complete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: COMPLETED */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'COMPLETED')}
            className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 flex flex-col min-h-[500px]"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-slate-900">Completed</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {completedTasks.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-center text-xs text-slate-400 border border-dashed border-emerald-200 rounded-xl p-4">
                  No completed tasks yet. Completed cards appear here.
                </div>
              ) : (
                completedTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 opacity-90 hover:opacity-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 line-through decoration-slate-400">
                        {task.title}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{task.patientName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{task.department}</span>
                        <span>{task.assignedTo}</span>
                      </div>
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-sky-700 hover:bg-slate-100 transition-colors"
                        title="Reopen Task"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400 text-xs">
                      No matching tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs">
                        {t.title}
                        {t.description && (
                          <p className="text-xs font-normal text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{t.patientName}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{t.department}</td>
                      <td className="px-6 py-4 text-xs text-slate-700 font-medium">{t.assignedTo}</td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">{t.dueDate}</td>
                      <td className="px-6 py-4">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
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
      )}
    </div>
  );
};
