import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import HospitalLayout from './layouts/HospitalLayout';
import DoctorLayout from './layouts/DoctorLayout';

// Patient Portal Pages
import Dashboard from './pages/patient/Dashboard';
import ReportEntry from './pages/patient/ReportEntry';
import WhatIfAssistant from './pages/patient/WhatIfAssistant';

// Hospital Portal Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalDoctors from './pages/hospital/HospitalDoctors';
import HospitalDepartments from './pages/hospital/HospitalDepartments';
import HospitalLabReports from './pages/hospital/HospitalLabReports';
import HospitalCriticalAlerts from './pages/hospital/HospitalCriticalAlerts';
import HospitalCareQueue from './pages/hospital/HospitalCareQueue';
import HospitalAppointments from './pages/hospital/HospitalAppointments';
import HospitalAnalytics from './pages/hospital/HospitalAnalytics';
import HospitalProfile from './pages/hospital/HospitalProfile';

// Doctor Portal Pages
import DoctorHome from './pages/doctor/DoctorHome';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorEmergencySOS from './pages/doctor/DoctorEmergencySOS';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Loading Spinner Component
function AppLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-strong)' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(124, 58, 237, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading MedX Health Intelligence...</div>
    </div>
  );
}

// Main Routing Switch based on Role
function RoleBasedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // --- 1. PATIENT PORTAL ROUTES ---
  if (user.role === 'patient') {
    return (
      <PatientLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/entry" element={<ReportEntry />} />
          <Route path="/whatif" element={<WhatIfAssistant />} />
          {/* Prevent routing to auth if already logged in */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PatientLayout>
    );
  }

  // --- 2. HOSPITAL ADMIN PORTAL ROUTES ---
  if (user.role === 'hospital_admin') {
    return (
      <HospitalLayout>
        <Routes>
          <Route path="/" element={<HospitalDashboard />} />
          <Route path="/patients" element={<HospitalPatients />} />
          <Route path="/doctors" element={<HospitalDoctors />} />
          <Route path="/departments" element={<HospitalDepartments />} />
          <Route path="/lab-reports" element={<HospitalLabReports />} />
          <Route path="/critical-alerts" element={<HospitalCriticalAlerts />} />
          <Route path="/care-queue" element={<HospitalCareQueue />} />
          <Route path="/appointments" element={<HospitalAppointments />} />
          <Route path="/analytics" element={<HospitalAnalytics />} />
          <Route path="/profile" element={<HospitalProfile />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HospitalLayout>
    );
  }

  // --- 3. DOCTOR PORTAL ROUTES ---
  if (user.role === 'doctor') {
    return (
      <DoctorLayout>
        <Routes>
          <Route path="/" element={<DoctorHome />} />
          <Route path="/patients" element={<DoctorPatients />} />
          <Route path="/appointments" element={<DoctorAppointments />} />
          <Route path="/medical-records" element={<DoctorMedicalRecords />} />
          <Route path="/messages" element={<DoctorMessages />} />
          <Route path="/emergency-sos" element={<DoctorEmergencySOS />} />
          <Route path="/availability" element={<DoctorAvailability />} />
          <Route path="/profile" element={<DoctorProfile />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DoctorLayout>
    );
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleBasedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
