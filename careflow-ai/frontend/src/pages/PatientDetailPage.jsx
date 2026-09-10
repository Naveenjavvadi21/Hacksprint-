import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Sparkles, 
  CheckSquare, 
  CalendarClock, 
  History, 
  Upload, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Stethoscope,
  Activity
} from 'lucide-react';
import { patientApi, documentApi, aiApi, taskApi, followUpApi } from '../services/api';
import { TaskStatusBadge, FollowUpStatusBadge, PriorityBadge, WorkflowStatusBadge } from '../components/StatusBadge';
import { AIBadge, AISafetyDisclaimer } from '../components/AIBadge';

export const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Upload Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    fileName: 'Doctor_Note_Followup.txt',
    documentType: 'DOCTOR_NOTE',
    content: 'Patient Ravi requires CBC testing. Lab report should be reviewed after 2 days. Schedule follow-up consultation after 7 days.',
  });
  const [uploading, setUploading] = useState(false);
  const [analyzingDocId, setAnalyzingDocId] = useState(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  const loadAllData = async () => {
    try {
      const [pRes, dRes, tRes, fRes, tmRes] = await Promise.all([
        patientApi.getById(id),
        documentApi.getByPatient(id),
        taskApi.getByPatient(id),
        followUpApi.getByPatient(id),
        patientApi.getTimeline(id),
      ]);

      setPatient(pRes.data);
      setDocuments(dRes.data);
      setTasks(tRes.data);
      setFollowUps(fRes.data);
      setTimeline(tmRes.data);
    } catch (err) {
      console.error('Failed to load patient detail data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id]);

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await documentApi.upload(id, uploadData);
      setShowUploadModal(false);
      loadAllData();
      setActiveTab('documents');
    } catch (err) {
      alert('Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleRunAIAnalysis = async (docId) => {
    setAnalyzingDocId(docId);
    try {
      const res = await aiApi.analyzeDocument(docId);
      setAiAnalysisResult(res.data);
      loadAllData();
      setActiveTab('ai-summary');
    } catch (err) {
      alert('AI Analysis failed.');
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleViewAnalysis = async (docId) => {
    setAnalyzingDocId(docId);
    try {
      const res = await aiApi.getAnalysis(docId);
      setAiAnalysisResult(res.data);
      setActiveTab('ai-summary');
    } catch (err) {
      handleRunAIAnalysis(docId);
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleCreateTasksFromAI = async () => {
    const actionsList = aiAnalysisResult?.actions || aiAnalysisResult?.extractedActions;
    if (!aiAnalysisResult || !actionsList || actionsList.length === 0) return;
    try {
      await taskApi.createBatch({
        patientId: parseInt(id, 10),
        analysisId: aiAnalysisResult.id,
        actions: actionsList,
      });
      loadAllData();
      setActiveTab('tasks');
    } catch (err) {
      alert('Failed to create tasks from AI analysis.');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      loadAllData();
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading patient care record...
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8 text-center text-rose-500 font-semibold">Patient record not found.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Back Link */}
      <Link to="/patients" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Patient Registry</span>
      </Link>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            {patient.name ? patient.name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
              <WorkflowStatusBadge status={patient.workflowStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">{patient.patientCode}</span>
              <span>•</span>
              <span>{patient.age} years old ({patient.gender})</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                Doctor: {patient.doctor}
              </span>
              <span>•</span>
              <span>Phone: {patient.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { id: 'ai-summary', label: 'AI Summary', icon: Sparkles, badge: true },
          { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          { id: 'follow-ups', label: `Follow-ups (${followUps.length})`, icon: CalendarClock },
          { id: 'timeline', label: 'Patient Timeline', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && <AIBadge text="AI" size="small" />}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Patient Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {patient.name} ({patient.patientCode}) is an active care patient assigned to {patient.doctor}. Complete workflow tracking is managed via CareFlow AI.
            </p>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Total Uploaded Documents</span>
                <span className="text-base font-bold text-slate-800">{documents.length} Records</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Total Tasks Created</span>
                <span className="text-base font-bold text-slate-800">{tasks.length} Tasks</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-900 text-white rounded-2xl p-6 space-y-4 shadow-lg border border-purple-800">
            <AIBadge text="✨ AI Assistant Workflow" />
            <h4 className="font-bold text-base">Extract Action Items</h4>
            <p className="text-xs text-purple-200 leading-relaxed">
              Upload clinical documentation or use our demo doctor note to extract actionable laboratory tests, review dates, and follow-up consultations automatically.
            </p>
            <button
              onClick={() => setActiveTab('ai-summary')}
              className="w-full py-2 bg-white text-purple-900 font-bold text-xs rounded-xl hover:bg-purple-50 transition-colors"
            >
              Open AI Summary
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Uploaded Healthcare Documents</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No documents uploaded for this patient yet.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span className="font-semibold text-slate-900 text-sm">{doc.fileName}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {doc.documentType}
                      </span>
                      {doc.aiProcessed && <AIBadge text="AI Processed" size="small" />}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{doc.content}</p>
                  </div>

                  {doc.aiProcessed ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleViewAnalysis(doc.id)}
                        disabled={analyzingDocId === doc.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl border border-purple-200 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        <span>View AI Summary</span>
                      </button>
                      <button
                        onClick={() => handleRunAIAnalysis(doc.id)}
                        disabled={analyzingDocId === doc.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        title="Re-run AI extraction"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>{analyzingDocId === doc.id ? 'Analyzing...' : 'Re-analyze'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRunAIAnalysis(doc.id)}
                      disabled={analyzingDocId === doc.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-xs transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{analyzingDocId === doc.id ? 'Analyzing...' : '✨ Analyze with AI'}</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI Summary */}
      {activeTab === 'ai-summary' && (
        <div className="space-y-6">
          {!aiAnalysisResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-purple-500 mx-auto animate-pulse" />
              <h3 className="font-bold text-slate-900 text-base">No Active AI Analysis Loaded</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Go to the Documents tab and click <span className="font-semibold text-purple-700">"✨ Analyze with AI"</span> on any document to extract care summary and tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Header Card */}
              <div className="bg-purple-900 text-white rounded-2xl p-6 shadow-xl border border-purple-800 space-y-4">
                <div className="flex items-center justify-between">
                  <AIBadge text="✨ AI Document Analysis Result" />
                  <span className="text-xs text-purple-200 font-mono">Doc ID: #{aiAnalysisResult.documentId || 'Demo'}</span>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-semibold text-purple-300 tracking-wider">Executive Summary</h3>
                  <p className="text-base font-medium mt-1 leading-relaxed">{aiAnalysisResult.summary}</p>
                </div>

                <div className="pt-3 border-t border-purple-800/80">
                  <h4 className="text-xs uppercase font-semibold text-purple-300 tracking-wider mb-2">Key Clinical Information</h4>
                  <ul className="list-disc list-inside text-xs text-purple-100 space-y-1">
                    {aiAnalysisResult.keyInformation?.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Extraction Cards */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Identified Actionable Tasks</h3>
                    <p className="text-xs text-slate-500">Actions extracted from document analysis ready to save to PostgreSQL</p>
                  </div>

                  <button
                    onClick={handleCreateTasksFromAI}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>[ Create Tasks in DB ]</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(aiAnalysisResult.actions || aiAnalysisResult.extractedActions || []).map((action, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{action.title}</span>
                        <PriorityBadge priority={action.priority} />
                      </div>
                      <p className="text-xs text-slate-600">{action.description}</p>
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Dept: <strong className="text-slate-800">{action.department}</strong></span>
                        <span>Assigned: <strong className="text-slate-800">{action.assignedTo}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <AISafetyDisclaimer />
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Patient Tasks</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No tasks created for this patient yet.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className="text-xs text-slate-500">{task.description}</p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Department: <strong className="text-slate-700">{task.department}</strong></span>
                      <span>Assigned: <strong className="text-slate-700">{task.assignedTo}</strong></span>
                      <span>Due: <strong className="text-slate-700 font-mono">{task.dueDate}</strong></span>
                    </div>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Follow-ups */}
      {activeTab === 'follow-ups' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Scheduled Follow-ups</h3>
          <div className="space-y-3">
            {followUps.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{f.type}</span>
                    <FollowUpStatusBadge status={f.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Doctor: {f.doctor} | Date: {f.scheduledDate}</p>
                  {f.notes && <p className="text-xs text-slate-600 mt-1 italic">"{f.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Patient Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Complete Patient Workflow Timeline</h3>
            <p className="text-xs text-slate-500">Real-time audit trail of admissions, documents, AI analyses, and task completions</p>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {timeline.map((event) => (
              <div key={event.id} className="relative pl-6">
                {/* Bullet Node */}
                <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                  event.type === 'AI_ANALYSIS' ? 'border-purple-600 bg-purple-50' :
                  event.type === 'TASK_COMPLETED' ? 'border-emerald-600 bg-emerald-50' :
                  'border-sky-600 bg-sky-50'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{event.title}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{event.description}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">Actor: {event.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Upload Patient Healthcare Document</h3>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document File Name</label>
                <input
                  type="text"
                  required
                  value={uploadData.fileName}
                  onChange={(e) => setUploadData({ ...uploadData, fileName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData({ ...uploadData, documentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="DOCTOR_NOTE">Doctor Note</option>
                  <option value="LAB_REPORT">Lab Report</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Content / Text</label>
                <textarea
                  rows="4"
                  required
                  value={uploadData.content}
                  onChange={(e) => setUploadData({ ...uploadData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {uploading ? 'Uploading...' : 'Save & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
