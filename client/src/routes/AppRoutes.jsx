import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Public Pages
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import AuthCallback from '../pages/AuthCallback.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';

// Role Workspace Shells
import PatientWorkspace from '../pages/workspaces/PatientWorkspace.jsx';
import DoctorWorkspace from '../pages/workspaces/DoctorWorkspace.jsx';
import HospitalWorkspace from '../pages/workspaces/HospitalWorkspace.jsx';
import LabWorkspace from '../pages/workspaces/LabWorkspace.jsx';

export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Patient Workspace */}
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Protected Doctor Clinical Workstation */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Protected Hospital Operations */}
        <Route
          path="/hospital/*"
          element={
            <ProtectedRoute allowedRoles={['hospital_admin']}>
              <HospitalWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Protected Diagnostic Laboratory */}
        <Route
          path="/lab/*"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
