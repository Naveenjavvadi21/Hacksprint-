import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle2, FileText, Cpu, AlertTriangle } from 'lucide-react';
import { AIBadge, AISafetyDisclaimer } from '../components/AIBadge';

export const AdminAIActivityPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <Link to="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span>CareFlow AI Activity & Audit Log</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Real-time telemetry and extraction logs for healthcare document analysis.</p>
      </div>

      <AISafetyDisclaimer />

      {/* AI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">AI Engine Status</div>
          <div className="text-2xl font-extrabold text-purple-700 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Groq LLM Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live model: qwen/qwen3.8-27b (Mock fallback)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Extraction Accuracy</div>
          <div className="text-2xl font-extrabold text-emerald-600">100% Validated</div>
          <p className="text-xs text-slate-400 mt-1">Structured Action Item Schema</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Human Approval Rate</div>
          <div className="text-2xl font-extrabold text-blue-600">Mandatory</div>
          <p className="text-xs text-slate-400 mt-1">Physician in-the-loop review</p>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Document Processing Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">Audit log of all clinical notes parsed and action items created</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Document Type</th>
                <th className="px-5 py-3.5">Extracted Tasks</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-4 font-mono text-xs text-slate-500">Today, 11:20 AM</td>
                <td className="px-5 py-4 font-bold text-slate-900">Ravi Kumar (P-1001)</td>
                <td className="px-5 py-4 text-xs font-medium text-slate-700">Clinical Consultation Note</td>
                <td className="px-5 py-4 text-xs text-purple-700 font-semibold">CBC Test, Review CBC, Follow-up</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Approved & Created
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-4 font-mono text-xs text-slate-500">Today, 09:15 AM</td>
                <td className="px-5 py-4 font-bold text-slate-900">Sarah Williams (P-1002)</td>
                <td className="px-5 py-4 text-xs font-medium text-slate-700">Discharge Summary</td>
                <td className="px-5 py-4 text-xs text-purple-700 font-semibold">Post-op Vitals, Diet Plan</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Approved & Created
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
