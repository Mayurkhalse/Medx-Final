import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Avatar,
  Typography,
  Space,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await api.get('/patients/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Patient data fetch error:', err);
      }
    };

    fetchPatientData();
  }, []);

  const patient = data?.patient;
  const reports = data?.reports || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F6FA' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          height: 64,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo />
        <Space size={16}>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Med-X Home
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/hospital')}
            style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}
          >
            Hospital Admin Portal
          </Button>
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </Space>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Card */}
        <Card className="medx-card" style={{ borderRadius: 12, borderTop: '4px solid #2563EB', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={56} src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#2563EB' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
                  {patient?.name || user?.name || 'Mayur Deshmukh'}
                </Title>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Patient ID: <strong style={{ color: '#6D28D9' }}>{patient?.patientId || 'PT-1001'}</strong> • {patient?.age || 48} yrs • Blood Group: <Tag color="purple">{patient?.bloodGroup || 'B+'}</Tag>
                </div>
              </div>
            </div>

            <Tag color={patient?.alertStatus === 'Critical' ? 'red' : 'green'} style={{ fontSize: 13, padding: '4px 10px', fontWeight: 700 }}>
              Status: {patient?.alertStatus === 'Critical' ? 'Requires Medical Review' : 'Stable'}
            </Tag>
          </div>
        </Card>

        {/* Vitals overview */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>BLOOD PRESSURE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{patient?.vitals?.bloodPressure || '142/92'} mmHg</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>HEART RATE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{patient?.vitals?.heartRate || 84} bpm</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>SpO2 (OXYGEN)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>{patient?.vitals?.spO2 || 98}%</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>FASTING GLUCOSE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', marginTop: 4 }}>{patient?.vitals?.glucose || 280} mg/dL</div>
            </Card>
          </Col>
        </Row>

        {/* Reports Table */}
        <Card
          className="medx-card"
          style={{ borderRadius: 12, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
          title={<span style={{ fontWeight: 700, color: '#0F172A' }}>My Diagnostic Health Reports</span>}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={reports}
            rowKey="_id"
            pagination={false}
            columns={[
              {
                title: 'Report Name',
                dataIndex: 'reportName',
                key: 'reportName',
                render: (name) => <strong style={{ color: '#0F172A' }}>{name}</strong>,
              },
              {
                title: 'Type',
                dataIndex: 'reportType',
                key: 'reportType',
                render: (t) => <Tag color="purple">{t}</Tag>,
              },
              {
                title: 'Date',
                dataIndex: 'uploadedAt',
                key: 'date',
                render: (d) => dayjs(d).format('DD MMM YYYY'),
              },
              {
                title: 'Status',
                dataIndex: 'reviewStatus',
                key: 'reviewStatus',
                render: (s) => (
                  <Tag style={{ backgroundColor: s === 'Reviewed' ? '#DCFCE7' : '#FEF3C7', color: s === 'Reviewed' ? '#16A34A' : '#D97706', border: 'none', fontWeight: 700 }}>
                    {s}
                  </Tag>
                ),
              },
              {
                title: 'Action',
                key: 'act',
                render: (_, r) => (
                  <Button
                    size="small"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/hospital/reports/${r._id}`)}
                    style={{ color: '#6D28D9', fontWeight: 700 }}
                  >
                    View Parameters
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </main>
    </div>
  );
};

export default PatientDashboard;
