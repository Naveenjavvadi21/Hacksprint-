import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Sparkles, 
  Upload, 
  User, 
  Calendar, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { documentApi, aiApi } from '../services/api';
import { AIBadge } from '../components/AIBadge';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);

  const fetchDocuments = async () => {
    try {
      const res = await documentApi.getAll();
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAnalyze = async (docId) => {
    setAnalyzingId(docId);
    try {
      await aiApi.analyzeDocument(docId);
      alert('AI Analysis completed successfully!');
      fetchDocuments();
    } catch (err) {
      alert('AI Analysis failed.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.fileName?.toLowerCase().includes(search.toLowerCase()) ||
    d.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    d.documentType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-600" />
          <span>Clinical Documents Repository</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Store healthcare notes, lab reports, and discharge summaries for AI analysis.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search document name, patient, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading documents...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Uploaded By</th>
                  <th className="px-6 py-4">AI Processing State</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400 text-xs">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {doc.fileName}
                        <p className="text-xs font-normal text-slate-500 line-clamp-1 mt-0.5">{doc.content}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {doc.patientId ? (
                          <Link to={`/patients/${doc.patientId}`} className="hover:text-sky-600 hover:underline">
                            {doc.patientName}
                          </Link>
                        ) : (
                          doc.patientName
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{doc.documentType}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{doc.uploadedBy || 'Staff'}</td>
                      <td className="px-6 py-4">
                        {doc.aiProcessed ? (
                          <AIBadge text="AI Analysis Available" />
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Pending Analysis</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.aiProcessed && doc.patientId && (
                            <Link
                              to={`/patients/${doc.patientId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-lg border border-sky-200 transition-colors"
                            >
                              <span>View Care Plan</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleAnalyze(doc.id)}
                            disabled={analyzingId === doc.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg border border-purple-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{analyzingId === doc.id ? 'Analyzing...' : doc.aiProcessed ? 'Re-analyze' : 'Analyze AI'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
