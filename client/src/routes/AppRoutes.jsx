import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Public Pages
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import AuthCallback from '../pages/AuthCallback.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import CheckInPage from '../pages/CheckInPage.jsx';

// Role Workspace Shells
import PatientWorkspace from '../pages/workspaces/PatientWorkspace.jsx';
import DoctorWorkspace from '../pages/workspaces/DoctorWorkspace.jsx';
import HospitalWorkspace from '../pages/workspaces/HospitalWorkspace.jsx';
import LabWorkspace from '../pages/workspaces/LabWorkspace.jsx';

export function AppRoutes() {
  const location = useLocation();

  // Dynamic document title update with privacy and non-misleading medical terminology
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'Med-X — Connected Health & Diagnostics';
    } else if (path === '/login') {
      document.title = 'Sign In | Med-X';
    } else if (path === '/register') {
      document.title = 'Create Account | Med-X';
    } else if (path.startsWith('/check-in')) {
      document.title = 'Hospital Self Check-In & Live Queue | Med-X';
    } else if (path.startsWith('/patient')) {
      document.title = 'Patient Health Portal | Med-X';
    } else if (path.startsWith('/doctor')) {
      document.title = 'Clinical Workstation | Med-X';
    } else if (path.startsWith('/hospital')) {
      document.title = 'Hospital Operations Center | Med-X';
    } else if (path.startsWith('/lab')) {
      document.title = 'Diagnostic Laboratory | Med-X';
    } else if (path === '/unauthorized') {
      document.title = 'Access Restricted | Med-X';
    } else {
      document.title = 'Med-X';
    }
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Hospital Self Check-In & Live Queue Tracker */}
        <Route
          path="/check-in"
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor', 'hospital_admin']}>
              <CheckInPage />
            </ProtectedRoute>
          }
        />

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
