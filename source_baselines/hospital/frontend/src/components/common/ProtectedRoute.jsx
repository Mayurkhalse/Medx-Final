import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spin, Result, Button } from 'antd';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#f8fafc',
        }}
      >
        <Spin size="large" />
        <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>
          Authenticating Med-X Clinical Portal...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: 24,
        }}
      >
        <Result
          status="403"
          title="Access Restricted"
          subTitle={`Your current role '${user?.role}' does not have clinical administrator privileges for this module.`}
          extra={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button type="primary" onClick={() => (window.location.href = '/')}>
                Go to Med-X Home
              </Button>
              {user?.role === 'doctor' && (
                <Button onClick={() => (window.location.href = '/doctor')}>
                  Go to Doctor Portal
                </Button>
              )}
              {user?.role === 'patient' && (
                <Button onClick={() => (window.location.href = '/patient')}>
                  Go to Patient Portal
                </Button>
              )}
            </div>
          }
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
