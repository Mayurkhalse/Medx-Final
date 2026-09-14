import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Radio,
  Typography,
  Space,
  Badge,
  Avatar,
  Skeleton,
  message,
} from 'antd';
import {
  UsergroupAddOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  AlertOutlined,
  EyeOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/hospital/StatCard';
import DoctorAssignmentModal from '../../components/hospital/DoctorAssignmentModal';
import { hospitalApi } from '../../services/hospitalApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7days');
  const [dashboardData, setDashboardData] = useState(null);

  // Doctor assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState(null);
  const [selectedAlertForAssign, setSelectedAlertForAssign] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getDashboard(timeframe);
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      message.error('Failed to load real-time hospital dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeframe]);

  const handleOpenAssign = (patient, alert = null) => {
    setSelectedPatientForAssign(patient);
    setSelectedAlertForAssign(alert);
    setAssignmentModalOpen(true);
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await hospitalApi.updateAlert(alertId, {
        status: 'Resolved',
        hospitalNote: 'Reviewed and resolved by Hospital Admin.',
      });
      if (res.success) {
        message.success('Alert marked as reviewed and resolved.');
        fetchDashboard();
      }
    } catch (err) {
      message.error('Failed to update alert status.');
    }
  };

  // Recent Lab Reports table columns
  const reportColumns = [
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <div style={{ fontWeight: 700, color: '#0F172A' }}>
          {patient?.name || 'Unknown Patient'}
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>
            {patient?.patientId || 'PT-ID'}
          </div>
        </div>
      ),
    },
    {
      title: 'Report',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (name, record) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0F172A' }}>{name}</span>
          <div style={{ fontSize: 11, color: '#475569' }}>{record.reportType}</div>
        </div>
      ),
    },
    {
      title: 'Test Lab',
      dataIndex: 'labName',
      key: 'labName',
      render: (lab) => <span style={{ fontSize: 12, color: '#475569' }}>{lab || 'Med-X Lab'}</span>,
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date) => (
        <span style={{ fontSize: 12, color: '#475569' }}>
          {dayjs(date).format('hh:mm A, DD MMM')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'reviewStatus',
      key: 'status',
      render: (status) => {
        let bg = '#F3EEFF';
        let col = '#6D28D9';
        if (status === 'Reviewed') {
          bg = '#DCFCE7';
          col = '#16A34A';
        } else if (status === 'Requires Review') {
          bg = '#FEF3C7';
          col = '#D97706';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 600 }}>{status}</Tag>;
      },
    },
    {
      title: 'Doctor',
      dataIndex: 'reviewedByDoctorId',
      key: 'doctor',
      render: (doctor) => (
        doctor?.name ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9' }}>{doctor.name}</span>
        ) : (
          <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Not Assigned</span>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/hospital/reports/${record._id}`)}
          style={{ padding: 0, fontWeight: 700, color: '#6D28D9' }}
        >
          View
        </Button>
      ),
    },
  ];

  // Doctor Workload columns
  const doctorColumns = [
    {
      title: 'Doctor',
      dataIndex: 'name',
      key: 'name',
      render: (name, doc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={doc.avatar} icon={<MedicineBoxOutlined />} style={{ backgroundColor: '#6D28D9' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#0F172A' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{doc.qualification}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      key: 'department',
      render: (dept) => (
        <Tag style={{ backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE', fontWeight: 600 }}>
          {dept?.name || 'General Medicine'}
        </Tag>
      ),
    },
    {
      title: "Today's Patients",
      dataIndex: 'todayPatientsCount',
      key: 'todayPatients',
      align: 'center',
      render: (count) => (
        <span style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Pending Reviews',
      dataIndex: 'pendingReviewsCount',
      key: 'pendingReviews',
      align: 'center',
      render: (count) => (
        <Badge
          count={count || 0}
          style={{
            backgroundColor: count > 4 ? '#DC2626' : '#F59E0B',
            color: '#FFFFFF',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availabilityStatus',
      key: 'availability',
      render: (status) => {
        let bg = '#DCFCE7';
        let col = '#16A34A';
        if (status === 'Busy') {
          bg = '#FEF3C7';
          col = '#D97706';
        }
        if (status === 'In Surgery' || status === 'On Leave') {
          bg = '#FEE2E2';
          col = '#DC2626';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 600 }}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, doc) => (
        <Button
          size="small"
          onClick={() => navigate(`/hospital/doctors`)}
          style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9', borderColor: '#DDD6FE' }}
        >
          View Doctor
        </Button>
      ),
    },
  ];

  const stats = dashboardData?.stats || {
    totalPatients: '1,248',
    patientsMonthTrend: '+8.4% this month',
    doctors: 32,
    todayAppointments: 86,
    pendingReports: 147,
    criticalAlerts: 12,
  };

  const activityData = dashboardData?.activityChart || [];
  const reportOverview = [
    { name: 'Normal', value: 42, color: '#16A34A' },
    { name: 'Abnormal', value: 18, color: '#F59E0B' },
    { name: 'Critical', value: 7, color: '#DC2626' },
    { name: 'Pending Review', value: 24, color: '#6D28D9' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Dashboard Subheader */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Hospital Overview & Patient Coordination
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Monitor patient care, laboratory reports, critical health alerts, and clinical workload in real-time.
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDashboard}
            loading={loading}
            style={{ fontWeight: 600, color: '#0F172A' }}
          >
            Refresh Feed
          </Button>
          <Button
            type="primary"
            icon={<AlertOutlined />}
            onClick={() => navigate('/hospital/alerts')}
            style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', fontWeight: 700 }}
          >
            Triage Alerts ({stats.criticalAlerts})
          </Button>
        </Space>
      </div>

      {/* 5 Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            trend={stats.patientsMonthTrend}
            trendType="positive"
            icon={<UsergroupAddOutlined />}
            iconBg="#F3EEFF"
            iconColor="#6D28D9"
            to="/hospital/patients"
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <StatCard
            title="Doctors Active"
            value={stats.doctors}
            subtitle="5 Specialties"
            icon={<MedicineBoxOutlined />}
            iconBg="#F3EEFF"
            iconColor="#7C3AED"
            to="/hospital/doctors"
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            subtitle="Scheduled today"
            icon={<CalendarOutlined />}
            iconBg="#DCFCE7"
            iconColor="#16A34A"
            to="/hospital/appointments"
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            subtitle="Awaiting physician"
            icon={<FileDoneOutlined />}
            iconBg="#FEF3C7"
            iconColor="#F59E0B"
            to="/hospital/reports"
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            trend="Requires Action"
            trendType="negative"
            icon={<AlertOutlined />}
            iconBg="#FEE2E2"
            iconColor="#DC2626"
            to="/hospital/alerts"
          />
        </Col>
      </Row>

      {/* Charts Row: Patient Activity Chart + Health Report Overview */}
      <Row gutter={[20, 20]}>
        {/* Patient Activity Area Chart */}
        <Col xs={24} lg={15}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Patient Activity Trends</span>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>
                    Inflow & consultation volume breakdown
                  </div>
                </div>
                <Radio.Group
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  size="small"
                  buttonStyle="solid"
                >
                  <Radio.Button value="today">Today</Radio.Button>
                  <Radio.Button value="7days">7 Days</Radio.Button>
                  <Radio.Button value="30days">30 Days</Radio.Button>
                  <Radio.Button value="3months">3 Months</Radio.Button>
                </Radio.Group>
              </div>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey={timeframe === 'today' ? 'time' : timeframe === '3months' ? 'month' : timeframe === '30days' ? 'date' : 'day'}
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      name="Total Volume"
                      stroke="#6D28D9"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPatients)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outpatient"
                      name="Outpatient (OPD)"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOutpatient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="emergency"
                      name="Emergency Unit"
                      stroke="#DC2626"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEmergency)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Health Report Overview */}
        <Col xs={24} lg={9}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={
              <div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Health Report Overview</span>
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>
                  Laboratory triage distribution
                </div>
              </div>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={reportOverview}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {reportOverview.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', width: '100%', marginTop: 4 }}>
                  {reportOverview.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                        <span style={{ fontSize: 12, color: '#475569' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Prominent Critical Health Alerts Section */}
      <Card
        className="medx-card"
        style={{
          borderRadius: 12,
          borderLeft: '4px solid #DC2626',
          backgroundColor: '#FFFBFB',
        }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertOutlined style={{ color: '#DC2626', fontSize: 18 }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#991B1B' }}>
                Critical Health Alerts (Requires Medical Review)
              </span>
              <Tag color="red" style={{ fontWeight: 700 }}>
                High Priority
              </Tag>
            </div>
            <Button
              type="link"
              onClick={() => navigate('/hospital/alerts')}
              style={{ color: '#6D28D9', fontWeight: 700, padding: 0 }}
            >
              View all alerts ({dashboardData?.criticalAlerts?.length || 0}) →
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dashboardData?.criticalAlerts && dashboardData.criticalAlerts.length > 0 ? (
            dashboardData.criticalAlerts.map((alert) => {
              const isCrit = alert.severity === 'Critical';
              return (
                <div
                  key={alert._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FEE2E2',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                        Patient
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                        {alert.patientId?.name || 'Patient'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                        Parameter
                      </span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                        {alert.parameter}: <span style={{ color: '#DC2626', fontWeight: 700 }}>{alert.value}</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                        Status
                      </span>
                      <div>
                        <Tag color={isCrit ? 'red' : 'volcano'} style={{ fontWeight: 600 }}>
                          {isCrit ? 'Critical • Requires Review' : 'Low / Abnormal'}
                        </Tag>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                        Report
                      </span>
                      <div style={{ fontSize: 13, color: '#475569' }}>
                        {alert.reportName || 'Laboratory Report'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                        Generated
                      </span>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>
                        {dayjs(alert.generatedAt || alert.createdAt).format('hh:mm A')}
                      </div>
                    </div>
                  </div>

                  {/* Alert Actions */}
                  <Space size={8}>
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        alert.reportId
                          ? navigate(`/hospital/reports/${alert.reportId?._id || alert.reportId}`)
                          : navigate(`/hospital/patients/${alert.patientId?._id}`)
                      }
                      style={{ fontSize: 12, color: '#0F172A' }}
                    >
                      View Report
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<UserAddOutlined />}
                      onClick={() => handleOpenAssign(alert.patientId, alert)}
                      style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontSize: 12, fontWeight: 600 }}
                    >
                      Assign Doctor
                    </Button>
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolveAlert(alert._id)}
                      style={{ fontSize: 12, color: '#16A34A', borderColor: '#BBF7D0' }}
                    >
                      Mark Reviewed
                    </Button>
                  </Space>
                </div>
              );
            })
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#475569' }}>
              <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 24, marginBottom: 8 }} />
              <div>No unresolved critical health alerts at this moment.</div>
            </div>
          )}
        </div>
      </Card>

      {/* Two Columns: Recent Lab Reports & Doctor Workload */}
      <Row gutter={[20, 20]}>
        {/* Recent Lab Reports Table */}
        <Col xs={24} xl={14}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12 }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Recent Laboratory Reports</span>
                <Button
                  type="link"
                  onClick={() => navigate('/hospital/reports')}
                  style={{ color: '#6D28D9', fontWeight: 700, padding: 0 }}
                >
                  View all →
                </Button>
              </div>
            }
          >
            <Table
              columns={reportColumns}
              dataSource={dashboardData?.recentReports || []}
              rowKey="_id"
              pagination={false}
              size="middle"
              loading={loading}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        {/* Doctor Workload Monitor */}
        <Col xs={24} xl={10}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12 }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Doctor Workload & Status</span>
                <Button
                  type="link"
                  onClick={() => navigate('/hospital/doctors')}
                  style={{ color: '#6D28D9', fontWeight: 700, padding: 0 }}
                >
                  Manage staff →
                </Button>
              </div>
            }
          >
            <Table
              columns={doctorColumns}
              dataSource={dashboardData?.doctorsWorkload || []}
              rowKey="_id"
              pagination={false}
              size="middle"
              loading={loading}
              scroll={{ x: 500 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Doctor Assignment Workflow Modal */}
      <DoctorAssignmentModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        patient={selectedPatientForAssign}
        alert={selectedAlertForAssign}
        onSuccess={() => {
          fetchDashboard();
        }}
      />
    </div>
  );
};

export default HospitalDashboard;
