import React from "react";
import Monitoring from "./features/monitoring/Monitoring";
import Alerts from "./features/alerts/Alerts";
import Medicines from "./features/medicines/Medicines";
import Devices from "./features/devices/Devices";
import AskMedX from "./features/ai/AskMedX";
import Profile from "./features/profile/Profile";
import ReportDetail from "./features/reports/ReportDetail";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";

import LandingPage from "./features/landing/LandingPage";
import Dashboard from "./features/dashboard/Dashboard";
import Health from "./features/health/Health";
import Reports from "./features/reports/Reports";
import ProfessionalDashboard from "./features/professional/ProfessionalDashboard";
import ProfessionalSection from "./features/professional/ProfessionalSection";
const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    loading
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div
        className="loading"
        style={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;

    if (redirectTo && redirectTo !== "/login") {
      localStorage.setItem("postLoginRedirect", redirectTo);
    }

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  return children;
};

const AuthCallbackHandler = () => {
  return <AuthCallback />;
};

function App() {
  return (
    <div className="App">
      <Navbar />

      <main>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallbackHandler />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <Health />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <Monitoring />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medicines"
            element={
              <ProtectedRoute>
                <Medicines />
              </ProtectedRoute>
            }
          />

          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <Devices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ask-medx"
            element={
              <ProtectedRoute>
                <AskMedX />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professional"
            element={
              <ProtectedRoute>
                <ProfessionalDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professional/patients"
            element={
              <ProtectedRoute>
                <ProfessionalSection section="patients" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professional/reports"
            element={
              <ProtectedRoute>
                <ProfessionalSection section="reports" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professional/monitoring"
            element={
              <ProtectedRoute>
                <ProfessionalSection section="monitoring" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professional/alerts"
            element={
              <ProtectedRoute>
                <ProfessionalSection section="alerts" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professional/ask-medx"
            element={
              <ProtectedRoute>
                <ProfessionalSection section="ask" />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
