import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { Outlet, useLocation, Link } from 'react-router-dom';
import HospitalHeader from '../components/hospital/HospitalHeader';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Content, Footer } = Layout;

const HospitalLayout = () => {
  const location = useLocation();

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = [
    {
      title: <Link to="/hospital" style={{ color: '#6D28D9', fontWeight: 600 }}>Hospital</Link>,
    },
  ];

  if (pathSnippets.length > 1) {
    const subRoute = pathSnippets[1];
    const subRouteNames = {
      patients: 'Patient Directory',
      doctors: 'Doctor Management',
      departments: 'Departments',
      reports: 'Lab Reports',
      alerts: 'Critical Health Alerts',
      appointments: 'Hospital Appointments',
      'care-queue': 'Care Queue Pipeline',
      analytics: 'Hospital Analytics',
      profile: 'Hospital Profile',
    };

    if (pathSnippets.length === 2) {
      breadcrumbItems.push({
        title: <span style={{ color: '#0F172A', fontWeight: 600 }}>{subRouteNames[subRoute] || subRoute}</span>,
      });
    } else if (pathSnippets.length > 2) {
      breadcrumbItems.push({
        title: <Link to={`/hospital/${subRoute}`} style={{ color: '#6D28D9' }}>{subRouteNames[subRoute] || subRoute}</Link>,
      });
      breadcrumbItems.push({
        title: <span style={{ color: '#0F172A', fontWeight: 600 }}>Details: {pathSnippets[2]}</span>,
      });
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F5F6FA' }}>
      {/* Top Header with Global Search and Horizontal Navigation Tabs */}
      <HospitalHeader />

      {/* Main Content Area */}
      <Content style={{ padding: '20px 24px', maxWidth: 1600, width: '100%', margin: '0 auto', minHeight: 'calc(100vh - 160px)' }}>
        {/* Breadcrumb & Medical Safety Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Breadcrumb items={breadcrumbItems} style={{ fontSize: 13 }} />

          {/* Clinical Safety Notice in Lavender */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              backgroundColor: '#F3EEFF',
              border: '1px solid #DDD6FE',
              fontSize: 12,
              color: '#6D28D9',
              fontWeight: 600,
            }}
          >
            <InfoCircleOutlined style={{ fontSize: 14 }} />
            <span>AI Clinical Decision Support Active • Physician Oversight Required</span>
          </div>
        </div>

        {/* Submodule View */}
        <Outlet />
      </Content>

      {/* Footer */}
      <Footer
        style={{
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '16px 24px',
          fontSize: 12,
          color: '#475569',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>Med-X Hospital Admin Portal</span> • AI-Powered Healthcare Ecosystem.
          <br />
          <span style={{ color: '#64748B' }}>
            Safety Disclaimer: Med-X assists with patient prioritization, parameter alerts, summaries, and coordination. Final medical decisions remain strictly with qualified healthcare professionals.
          </span>
        </div>
      </Footer>
    </Layout>
  );
};

export default HospitalLayout;
