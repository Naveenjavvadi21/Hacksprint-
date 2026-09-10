import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboardPage } from './AdminDashboardPage';
import { DoctorDashboardPage } from './DoctorDashboardPage';
import { NurseDashboardPage } from './NurseDashboardPage';

export const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Verifying CareFlow Session...</p>
        </div>
      </div>
    );
  }

  const role = user?.role;

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (role === 'NURSE' || role === 'STAFF') return <Navigate to="/nurse/dashboard" replace />;

  return <Navigate to="/doctor/dashboard" replace />;
};
