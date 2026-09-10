import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = rawBaseUrl.endsWith('/') 
  ? rawBaseUrl.slice(0, -1) + '/api' 
  : (rawBaseUrl ? `${rawBaseUrl}/api` : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Request Interceptor to add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add Response Interceptor for Unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('careflow_token');
      localStorage.removeItem('careflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Patient APIs
export const patientApi = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  getTimeline: (id) => api.get(`/patients/${id}/timeline`),
};

// Document APIs
export const documentApi = {
  getAll: () => api.get('/documents'),
  getByPatient: (patientId) => api.get(`/documents/patient/${patientId}`),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (patientId, data) => api.post(`/documents/upload/${patientId}`, data),
};

// AI APIs
export const aiApi = {
  analyzeDocument: (documentId) => api.post(`/ai/analyze/${documentId}`),
  getAnalysis: (documentId) => api.get(`/ai/document/${documentId}`),
  directAnalyze: (data) => api.post('/ai/direct-analyze', data),
};

// Task APIs
export const taskApi = {
  getAll: () => api.get('/tasks'),
  getByPatient: (patientId) => api.get(`/tasks/patient/${patientId}`),
  create: (data) => api.post('/tasks', data),
  createBatch: (data) => api.post('/tasks/batch-create', data),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  updateAssignee: (id, data) => api.put(`/tasks/${id}/assign`, data),
};

// FollowUp APIs
export const followUpApi = {
  getAll: () => api.get('/followups'),
  getByPatient: (patientId) => api.get(`/followups/patient/${patientId}`),
  create: (data) => api.post('/followups', data),
  updateStatus: (id, status) => api.put(`/followups/${id}/status`, { status }),
};

// Dashboard API
export const dashboardApi = {
  getMetrics: (role, user) => {
    const params = {};
    if (role) params.role = role;
    if (user) params.user = user;
    return api.get('/dashboard', { params });
  },
  getAdmin: () => api.get('/dashboard/admin'),
  getDoctor: (doctor) => api.get('/dashboard/doctor', { params: { doctor } }),
  getNurse: (nurse) => api.get('/dashboard/nurse', { params: { nurse } }),
};

export default api;
