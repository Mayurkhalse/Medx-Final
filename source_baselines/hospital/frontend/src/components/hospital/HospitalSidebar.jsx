import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
  AlertOutlined,
  CalendarOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

const { Sider } = Layout;

const HospitalSidebar = ({ collapsed, isMobile, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/hospital' || path === '/hospital/') return 'dashboard';
    if (path.startsWith('/hospital/patients')) return 'patients';
    if (path.startsWith('/hospital/doctors')) return 'doctors';
    if (path.startsWith('/hospital/departments')) return 'departments';
    if (path.startsWith('/hospital/reports')) return 'reports';
    if (path.startsWith('/hospital/alerts')) return 'alerts';
    if (path.startsWith('/hospital/appointments')) return 'appointments';
    if (path.startsWith('/hospital/care-queue')) return 'care-queue';
    if (path.startsWith('/hospital/analytics')) return 'analytics';
    if (path.startsWith('/hospital/profile')) return 'profile';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: 'Dashboard',
      onClick: () => {
        navigate('/hospital');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'patients',
      icon: <UsergroupAddOutlined style={{ fontSize: 16 }} />,
      label: 'Patients',
      onClick: () => {
        navigate('/hospital/patients');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'doctors',
      icon: <MedicineBoxOutlined style={{ fontSize: 16 }} />,
      label: 'Doctors',
      onClick: () => {
        navigate('/hospital/doctors');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'departments',
      icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
      label: 'Departments',
      onClick: () => {
        navigate('/hospital/departments');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'reports',
      icon: <FileDoneOutlined style={{ fontSize: 16 }} />,
      label: 'Lab Reports',
      onClick: () => {
        navigate('/hospital/reports');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'alerts',
      icon: <AlertOutlined style={{ fontSize: 16, color: '#F87171' }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Critical Alerts</span>
          <span
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 10,
            }}
          >
            12
          </span>
        </div>
      ),
      onClick: () => {
        navigate('/hospital/alerts');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'care-queue',
      icon: <OrderedListOutlined style={{ fontSize: 16 }} />,
      label: 'Care Queue',
      onClick: () => {
        navigate('/hospital/care-queue');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined style={{ fontSize: 16 }} />,
      label: 'Appointments',
      onClick: () => {
        navigate('/hospital/appointments');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined style={{ fontSize: 16 }} />,
      label: 'Analytics',
      onClick: () => {
        navigate('/hospital/analytics');
        if (isMobile) setMobileOpen(false);
      },
    },
    {
      key: 'profile',
      icon: <BankOutlined style={{ fontSize: 16 }} />,
      label: 'Hospital Profile',
      onClick: () => {
        navigate('/hospital/profile');
        if (isMobile) setMobileOpen(false);
      },
    },
  ];

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0F172A',
      }}
    >
      {/* Brand Header with Med-X Logo (navigates to /) */}
      <div
        style={{
          height: 64,
          padding: collapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0A0F1D',
        }}
      >
        <Logo collapsed={collapsed} light={true} />
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{
            backgroundColor: 'transparent',
            borderRight: 0,
            fontSize: 14,
            fontWeight: 500,
          }}
        />
      </div>

      {/* Footer info in sidebar */}
      {!collapsed && (
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: '#E2E8F0' }}>Med-X Ecosystem</span>
            <br />
            AI Decision Support Module
            <br />
            <span style={{ fontSize: 10, color: '#7C3AED', fontWeight: 600 }}>v2.4.0 • Enterprise</span>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{ body: { padding: 0, backgroundColor: '#0F172A' } }}
        width={260}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      collapsedWidth={72}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 101,
        backgroundColor: '#0F172A',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {sidebarContent}
    </Sider>
  );
};

export default HospitalSidebar;
