import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { NurseDashboardPage } from './pages/NurseDashboardPage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminAIActivityPage } from './pages/AdminAIActivityPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { TasksPage } from './pages/TasksPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
        Verifying Authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar />
      <Navbar />
      <main className="ml-64 flex-1 pb-16">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Main Redirector */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />

          {/* Dedicated Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedLayout>
                <AdminDashboardPage />
              </ProtectedLayout>
            }
          />

          {/* Admin Sub-pages */}
          <Route
            path="/admin/staff"
            element={
              <ProtectedLayout>
                <AdminStaffPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/ai-activity"
            element={
              <ProtectedLayout>
                <AdminAIActivityPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedLayout>
                <AdminSettingsPage />
              </ProtectedLayout>
            }
          />

          {/* Dedicated Doctor Dashboard */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedLayout>
                <DoctorDashboardPage />
              </ProtectedLayout>
            }
          />

          {/* Dedicated Nurse Dashboard */}
          <Route
            path="/nurse/dashboard"
            element={
              <ProtectedLayout>
                <NurseDashboardPage />
              </ProtectedLayout>
            }
          />

          {/* Shared Clinical Workflow Pages */}
          <Route
            path="/patients"
            element={
              <ProtectedLayout>
                <PatientsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/patients/:id"
            element={
              <ProtectedLayout>
                <PatientDetailPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/ai-assistant"
            element={
              <ProtectedLayout>
                <AIAssistantPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedLayout>
                <TasksPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedLayout>
                <DocumentsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/follow-ups"
            element={
              <ProtectedLayout>
                <FollowUpsPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
