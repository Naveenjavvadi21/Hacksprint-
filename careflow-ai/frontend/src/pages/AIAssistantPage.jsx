import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  CheckSquare, 
  ArrowRight, 
  Clock, 
  Building2, 
  UserCheck, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { aiApi, patientApi, taskApi } from '../services/api';
import { PriorityBadge } from '../components/StatusBadge';
import { AIBadge, AISafetyDisclaimer } from '../components/AIBadge';

export const AIAssistantPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [inputText, setInputText] = useState(
    'Patient Ravi requires CBC testing.\nLab report should be reviewed after 2 days.\nSchedule follow-up consultation after 7 days.'
  );
  
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [savingTasks, setSavingTasks] = useState(false);
  const [tasksCreated, setTasksCreated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    patientApi.getAll()
      .then((res) => {
        setPatients(res.data);
        const ravi = res.data.find((p) => p.patientCode === 'P-1001');
        if (ravi) {
          setSelectedPatientId(ravi.id.toString());
        } else if (res.data.length > 0) {
          setSelectedPatientId(res.data[0].id.toString());
        }
      })
      .catch((err) => console.error('Error fetching patients:', err));
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setProcessing(true);
    setAiResult(null);
    setTasksCreated(false);

    setProcessStep('Analyzing healthcare document...');
    setTimeout(() => {
      setProcessStep('Extracting key medical information...');
    }, 600);

    setTimeout(async () => {
      setProcessStep('Identifying actionable tasks & department routing...');
      try {
        const res = await aiApi.directAnalyze({ content: inputText });
        setAiResult(res.data);
      } catch (err) {
        alert('AI Analysis failed.');
      } finally {
        setProcessing(false);
        setProcessStep('');
      }
    }, 1200);
  };

  const handleCreateTasks = async () => {
    if (!aiResult || !selectedPatientId) return;

    setSavingTasks(true);
    try {
      await taskApi.createBatch({
        patientId: parseInt(selectedPatientId, 10),
        analysisId: aiResult.id,
        actions: aiResult.actions,
      });

      setTasksCreated(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 1500);
    } catch (err) {
      alert('Failed to save tasks to database.');
    } finally {
      setSavingTasks(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Title & Explanation */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>CareFlow AI Assistant Workspace</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Groq LLM Engine (qwen/qwen3.8-27b)</span>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Document Workflow Engine</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Analyze unformatted healthcare notes, discharge summaries, or clinical reports using real-time LLM inference to automatically extract care summaries and assign tasks directly to PostgreSQL.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Patient Record</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patientCode}) — Doctor: {p.doctor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quick Clinical Note Presets</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setInputText('Patient Ravi requires CBC testing.\nLab report should be reviewed after 2 days.\nSchedule follow-up consultation after 7 days.')}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200 transition-colors"
              >
                CBC & Follow-up
              </button>
              <button
                type="button"
                onClick={() => setInputText('Patient post-cardiac catheterization. BP monitoring required twice daily by nursing staff. Follow-up ECG scheduled in 10 days with Dr. Patel.')}
                className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-200 transition-colors"
              >
                Cardiac Post-Op
              </button>
              <button
                type="button"
                onClick={() => setInputText('Type 2 diabetic checkup. Elevated HbA1c at 8.4%. Refer to clinical dietitian for nutrition therapy. Schedule repeat blood glucose test in 14 days.')}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
              >
                Diabetic Consult
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Healthcare Note / Clinical Text</label>
          <textarea
            rows="5"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste doctor notes, lab instructions, or discharge summaries here..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={processing || !inputText.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>✨ Analyze with AI</span>
        </button>
      </div>

      {/* Processing State */}
      {processing && (
        <div className="bg-purple-900 text-white rounded-2xl p-8 text-center space-y-4 shadow-xl border border-purple-800 animate-pulse">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="font-bold text-base">{processStep}</h3>
          <p className="text-xs text-purple-200">Processing structured NLP pipeline...</p>
        </div>
      )}

      {/* AI Analysis Result */}
      {aiResult && !processing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <AIBadge text="AI Executive Summary Generated" />
              <span className="text-xs text-purple-300 font-mono">CareFlow AI Engine</span>
            </div>

            <div>
              <h3 className="text-xs uppercase font-semibold text-purple-400 tracking-wider">AI SUMMARY</h3>
              <p className="text-base font-semibold mt-1 leading-relaxed text-slate-100">{aiResult.summary}</p>
            </div>

            <div className="pt-3 border-t border-purple-800/60">
              <h4 className="text-xs uppercase font-semibold text-purple-400 tracking-wider mb-2">Key Extracted Information</h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {aiResult.keyInformation?.map((info, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Extraction Cards Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">IDENTIFIED ACTIONS</h3>
                <p className="text-xs text-slate-500">Review AI extracted tasks before committing to PostgreSQL database</p>
              </div>

              <button
                onClick={handleCreateTasks}
                disabled={savingTasks || tasksCreated}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {tasksCreated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Tasks Created! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>[ Create Tasks ]</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {aiResult.actions?.map((action, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{action.title}</h4>
                      <PriorityBadge priority={action.priority} />
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">{action.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-xs space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <strong className="text-slate-800">{action.department}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned To:</span>
                      <strong className="text-slate-800">{action.assignedTo}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Due In:</span>
                      <strong className="text-slate-800 font-mono">{action.dueInDays} days</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AISafetyDisclaimer />
        </div>
      )}
    </div>
  );
};
