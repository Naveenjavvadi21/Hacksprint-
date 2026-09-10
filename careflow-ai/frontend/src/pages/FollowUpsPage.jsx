import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Search, 
  Filter, 
  Clock, 
  User, 
  CheckCircle2 
} from 'lucide-react';
import { followUpApi } from '../services/api';
import { FollowUpStatusBadge } from '../components/StatusBadge';

export const FollowUpsPage = () => {
  const [followUps, setFollowUps] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    try {
      const res = await followUpApi.getAll();
      setFollowUps(res.data);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await followUpApi.updateStatus(id, newStatus);
      fetchFollowUps();
    } catch (err) {
      alert('Failed to update follow-up status.');
    }
  };

  const filteredFollowUps = followUps.filter((f) => {
    const matchesSearch =
      f.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      f.type?.toLowerCase().includes(search.toLowerCase()) ||
      f.doctor?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-sky-600" />
          <span>Follow-up Coordination</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate patient consultations, outpatient check-ups, and review appointments.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient, type, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DUE_TODAY">Due Today</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Follow Ups List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading follow-up schedule...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No follow-ups scheduled.</div>
            ) : (
              filteredFollowUps.map((f) => (
                <div key={f.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{f.patientName}</span>
                      <FollowUpStatusBadge status={f.status} />
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{f.type}</p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Doctor: <strong className="text-slate-800">{f.doctor}</strong></span>
                      <span>Scheduled Date: <strong className="text-slate-800 font-mono">{f.scheduledDate}</strong></span>
                    </div>
                    {f.notes && <p className="text-xs text-slate-500 italic">"{f.notes}"</p>}
                  </div>

                  <select
                    value={f.status}
                    onChange={(e) => handleStatusChange(f.id, e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="DUE_TODAY">Due Today</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
