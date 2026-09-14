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

const { Title } = Typography;

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const res = await api.get('/doctors/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Doctor data fetch error:', err);
      }
    };

    fetchDoctorData();
  }, []);

  const doctor = data?.doctor;
  const assignedPatients = data?.assignedPatients || [];

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
        {/* Doctor Banner */}
        <Card className="medx-card" style={{ borderRadius: 12, borderTop: '4px solid #7C3AED', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={56} src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#7C3AED' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
                  {doctor?.name || user?.name || 'Dr. Sonali Sen'}
                </Title>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  {doctor?.specialization || 'Internal Medicine'} • {doctor?.departmentId?.name || 'General Medicine'} • Room {doctor?.roomNumber || 'OPD-101'}
                </div>
              </div>
            </div>

            <Tag color="green" style={{ fontSize: 13, padding: '4px 10px', fontWeight: 700 }}>
              Status: Available
            </Tag>
          </div>
        </Card>

        {/* Doctor Summary Counters */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>TODAY'S CONSULTATIONS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {doctor?.todayPatientsCount || 18} Patients
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>PENDING REPORT REVIEWS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
                {doctor?.pendingReviewsCount || 5} Reports
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="medx-card" style={{ borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>ASSIGNED PATIENTS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                {assignedPatients.length || 6} Cases
              </div>
            </Card>
          </Col>
        </Row>

        {/* Assigned Patients Table */}
        <Card
          className="medx-card"
          style={{ borderRadius: 12, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
          title={<span style={{ fontWeight: 700, color: '#0F172A' }}>My Assigned Hospital Patients</span>}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={assignedPatients}
            rowKey="_id"
            pagination={false}
            columns={[
              {
                title: 'Patient Name',
                dataIndex: 'name',
                key: 'name',
                render: (n, r) => (
                  <div>
                    <strong style={{ color: '#0F172A' }}>{n}</strong>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>ID: {r.patientId}</div>
                  </div>
                ),
              },
              {
                title: 'Age / Gender',
                key: 'ageGender',
                render: (_, r) => `${r.age}y • ${r.gender}`,
              },
              {
                title: 'Alert Status',
                dataIndex: 'alertStatus',
                key: 'alertStatus',
                render: (st) => <Tag color={st === 'Critical' ? 'red' : 'green'}>{st || 'Normal'}</Tag>,
              },
              {
                title: 'Report Summary',
                dataIndex: 'latestReportSummary',
                key: 'summary',
                ellipsis: true,
              },
              {
                title: 'Action',
                key: 'act',
                render: (_, r) => (
                  <Button
                    size="small"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/hospital/patients/${r._id}`)}
                    style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}
                  >
                    Open Clinical Case
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

export default DoctorDashboard;
