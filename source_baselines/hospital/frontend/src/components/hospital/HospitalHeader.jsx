import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Dropdown,
  Badge,
  Button,
  Space,
  Input,
  Popover,
  List,
  Tag,
  Divider,
  message,
} from 'antd';
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
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hospitalApi } from '../../services/hospitalApi';
import Logo from '../common/Logo';
import dayjs from 'dayjs';

const HospitalHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(12);
  const [globalSearch, setGlobalSearch] = useState('');

  const fetchNotificationsAndCounts = async () => {
    try {
      const [notifRes, dashRes] = await Promise.all([
        hospitalApi.getNotifications(),
        hospitalApi.getDashboard('today'),
      ]);
      if (notifRes.success) {
        setNotifications(notifRes.notifications);
        setUnreadCount(notifRes.unreadCount);
      }
      if (dashRes.success && dashRes.stats) {
        setCriticalCount(dashRes.stats.criticalAlerts || 12);
      }
    } catch (err) {
      console.warn('Failed to load notifications/counts:', err);
    }
  };

  useEffect(() => {
    fetchNotificationsAndCounts();
    const interval = setInterval(fetchNotificationsAndCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/hospital/patients?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await hospitalApi.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      message.success('All notifications marked as read.');
    } catch (err) {
      message.error('Failed to update notifications.');
    }
  };

  const handleNotificationClick = async (item) => {
    try {
      if (!item.read) {
        await hospitalApi.markNotificationRead(item._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      }
      if (item.link) {
        navigate(item.link);
      }
    } catch (err) {
      console.warn('Error reading notification:', err);
    }
  };

  const navTabs = [
    {
      key: 'dashboard',
      path: '/hospital',
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      isActive: (p) => p === '/hospital' || p === '/hospital/',
    },
    {
      key: 'patients',
      path: '/hospital/patients',
      label: 'Patients',
      icon: <UsergroupAddOutlined />,
      isActive: (p) => p.startsWith('/hospital/patients'),
    },
    {
      key: 'doctors',
      path: '/hospital/doctors',
      label: 'Doctors',
      icon: <MedicineBoxOutlined />,
      isActive: (p) => p.startsWith('/hospital/doctors'),
    },
    {
      key: 'departments',
      path: '/hospital/departments',
      label: 'Departments',
      icon: <AppstoreOutlined />,
      isActive: (p) => p.startsWith('/hospital/departments'),
    },
    {
      key: 'reports',
      path: '/hospital/reports',
      label: 'Lab Reports',
      icon: <FileDoneOutlined />,
      isActive: (p) => p.startsWith('/hospital/reports'),
    },
    {
      key: 'alerts',
      path: '/hospital/alerts',
      label: 'Critical Alerts',
      icon: <AlertOutlined />,
      badge: criticalCount,
      isActive: (p) => p.startsWith('/hospital/alerts'),
    },
    {
      key: 'care-queue',
      path: '/hospital/care-queue',
      label: 'Care Queue',
      icon: <OrderedListOutlined />,
      isActive: (p) => p.startsWith('/hospital/care-queue'),
    },
    {
      key: 'appointments',
      path: '/hospital/appointments',
      label: 'Appointments',
      icon: <CalendarOutlined />,
      isActive: (p) => p.startsWith('/hospital/appointments'),
    },
    {
      key: 'analytics',
      path: '/hospital/analytics',
      label: 'Analytics',
      icon: <BarChartOutlined />,
      isActive: (p) => p.startsWith('/hospital/analytics'),
    },
    {
      key: 'profile',
      path: '/hospital/profile',
      label: 'Hospital Profile',
      icon: <BankOutlined />,
      isActive: (p) => p.startsWith('/hospital/profile'),
    },
  ];

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{user?.name || 'Hospital Admin'}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>{user?.email || 'admin@medx.com'}</div>
          <Tag color="purple" style={{ marginTop: 6, fontSize: 11, backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
            HOSPITAL ADMINISTRATOR
          </Tag>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <SettingOutlined style={{ color: '#6D28D9' }} />,
      label: <Link to="/hospital/profile" style={{ color: '#0F172A' }}>Hospital Profile & Settings</Link>,
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined style={{ color: '#7C3AED' }} />,
      label: <Link to="/hospital/analytics" style={{ color: '#0F172A' }}>Clinical Analytics</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#DC2626' }} />,
      danger: true,
      label: 'Logout',
      onClick: () => {
        logout();
        message.info('Logged out from Med-X Hospital Portal.');
        navigate('/login');
      },
    },
  ];

  const notificationContent = (
    <div style={{ width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 8,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Notifications</span>
          {unreadCount > 0 && <Tag color="error" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}>{unreadCount} New</Tag>}
        </div>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0, fontSize: 12, color: '#6D28D9' }}>
            Mark all read
          </Button>
        )}
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 320, paddingRight: 4, marginTop: 8 }}>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          locale={{ emptyText: 'No notifications at this time' }}
          renderItem={(item) => {
            const isCritical = item.severity === 'critical';
            return (
              <List.Item
                onClick={() => handleNotificationClick(item)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 6,
                  marginBottom: 4,
                  backgroundColor: item.read ? '#FFFFFF' : '#F3EEFF',
                  border: item.read ? '1px solid #E2E8F0' : '1px solid #DDD6FE',
                  transition: 'background 0.2s',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={28}
                      icon={isCritical ? <AlertOutlined /> : <BellOutlined />}
                      style={{
                        backgroundColor: isCritical ? '#FEE2E2' : '#F3EEFF',
                        color: isCritical ? '#DC2626' : '#6D28D9',
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: item.read ? 500 : 700, color: '#0F172A' }}>
                        {item.title}
                      </span>
                      {!item.read && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#6D28D9',
                          }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.3 }}>{item.message}</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                        {dayjs(item.createdAt).format('hh:mm A, DD MMM')}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>

      <Divider style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center' }}>
        <Link to="/hospital/alerts" style={{ fontSize: 12, color: '#6D28D9', fontWeight: 600 }}>
          View all critical alerts →
        </Link>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      {/* 1. TOP HEADER BAR */}
      <div
        style={{
          height: 64,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Logo size="default" />
        </div>

        {/* Center: Global Search Bar */}
        <div style={{ flex: 1, maxWidth: 640, minWidth: 220 }}>
          <Input
            placeholder="Search by patient name, ID, phone, department, or report..."
            prefix={<SearchOutlined style={{ color: '#94A3B8', fontSize: 15 }} />}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={handleGlobalSearch}
            allowClear
            style={{
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              fontSize: 13,
              boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          />
        </div>

        {/* Right: Critical Alerts Emergency Button, Notifications, Profile */}
        <Space size={16} align="center" style={{ flexShrink: 0 }}>
          {/* Emergency / Critical Alert Button */}
          <Button
            type="default"
            icon={<ExclamationCircleOutlined style={{ color: '#DC2626' }} />}
            onClick={() => navigate('/hospital/alerts')}
            style={{
              borderColor: '#FECACA',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontWeight: 700,
              borderRadius: 20,
              height: 38,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Critical Alerts</span>
            <span
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 10,
              }}
            >
              {criticalCount}
            </span>
          </Button>

          {/* Notifications Popover */}
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            overlayInnerStyle={{ padding: 12 }}
          >
            <Badge count={unreadCount} overflowCount={99} offset={[-2, 4]} color="#6D28D9">
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: 18, color: '#475569' }} />}
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              />
            </Badge>
          </Popover>

          {/* User Profile */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: 24,
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', lineHeight: 1.2 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                  {user?.name || 'Dr. Rajesh Nair (Admin)'}
                </span>
                <span style={{ fontSize: 11, color: '#475569' }}>Hospital Administrator</span>
              </div>
              <Avatar
                size={34}
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#6D28D9',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(109, 40, 217, 0.25)',
                }}
              />
            </div>
          </Dropdown>
        </Space>
      </div>

      {/* 2. HORIZONTAL NAVIGATION TAB BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 20px',
          backgroundColor: '#FFFFFF',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {navTabs.map((tab) => {
          const active = tab.isActive(location.pathname);
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 8,
                border: active ? '1px solid #6D28D9' : '1px solid transparent',
                backgroundColor: active ? '#6D28D9' : 'transparent',
                color: active ? '#FFFFFF' : '#475569',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                flexShrink: 0,
                boxShadow: active ? '0 2px 8px rgba(109, 40, 217, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = '#F3EEFF';
                  e.currentTarget.style.color = '#6D28D9';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <span style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    backgroundColor: active ? '#FFFFFF' : '#DC2626',
                    color: active ? '#DC2626' : '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 10,
                    marginLeft: 2,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalHeader;
