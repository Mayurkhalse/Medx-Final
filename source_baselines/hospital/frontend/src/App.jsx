import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { medxTheme } from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import HospitalLayout from './layouts/HospitalLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Hospital Module Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalPatientDetails from './pages/hospital/HospitalPatientDetails';
import HospitalAlerts from './pages/hospital/HospitalAlerts';
import HospitalReports from './pages/hospital/HospitalReports';
import HospitalReportDetails from './pages/hospital/HospitalReportDetails';
import HospitalCareQueue from './pages/hospital/HospitalCareQueue';
import HospitalAppointments from './pages/hospital/HospitalAppointments';
import HospitalDoctors from './pages/hospital/HospitalDoctors';
import HospitalDepartments from './pages/hospital/HospitalDepartments';
import HospitalAnalytics from './pages/hospital/HospitalAnalytics';
import HospitalProfile from './pages/hospital/HospitalProfile';

// Doctor & Patient Integrated Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';

function App() {
  return (
    <ConfigProvider theme={medxTheme}>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Hospital Module Routes (Protected for hospital_admin) */}
          <Route
            path="/hospital"
            element={
              <ProtectedRoute allowedRoles={['hospital_admin']}>
                <HospitalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HospitalDashboard />} />
            <Route path="patients" element={<HospitalPatients />} />
            <Route path="patients/:patientId" element={<HospitalPatientDetails />} />
            <Route path="reports" element={<HospitalReports />} />
            <Route path="reports/:reportId" element={<HospitalReportDetails />} />
            <Route path="alerts" element={<HospitalAlerts />} />
            <Route path="care-queue" element={<HospitalCareQueue />} />
            <Route path="appointments" element={<HospitalAppointments />} />
            <Route path="doctors" element={<HospitalDoctors />} />
            <Route path="departments" element={<HospitalDepartments />} />
            <Route path="analytics" element={<HospitalAnalytics />} />
            <Route path="profile" element={<HospitalProfile />} />
          </Route>

          {/* Doctor Portal Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'hospital_admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Patient Portal Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient', 'hospital_admin']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
