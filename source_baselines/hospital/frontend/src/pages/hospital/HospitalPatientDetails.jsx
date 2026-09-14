import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Tag,
  Button,
  Descriptions,
  Table,
  Timeline,
  Row,
  Col,
  Avatar,
  Skeleton,
  Empty,
  Space,
  Typography,
  message,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  AlertOutlined,
  LineChartOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  UserAddOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import DoctorAssignmentModal from '../../components/hospital/DoctorAssignmentModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const HospitalPatientDetails = () => {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getPatientById(patientId);
      if (res.success) {
        setPatientData(res);
      }
    } catch (err) {
      message.error('Failed to load patient profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const patient = patientData?.patient;
  const reports = patientData?.reports || [];
  const alerts = patientData?.alerts || [];
  const appointments = patientData?.appointments || [];
  const careTimeline = patientData?.careTimeline || [];
  const healthTrends = patientData?.healthTrends || [];

  const reportColumns = [
    {
      title: 'Report Name',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (name, record) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{name}</span>
          <div style={{ fontSize: 11, color: '#475569' }}>ID: {record.reportId}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (type) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: 'Lab',
      dataIndex: 'labId',
      key: 'lab',
      render: (lab, record) => record.labName || lab?.name || 'Med-X Lab',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadedAt',
      key: 'uploadDate',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Status',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
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
      title: 'Reviewed By',
      dataIndex: 'reviewedByDoctorId',
      key: 'reviewedBy',
      render: (doc) => (doc?.name ? <span style={{ color: '#6D28D9', fontWeight: 600 }}>{doc.name}</span> : <span style={{ color: '#94A3B8' }}>Pending</span>),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/hospital/reports/${record._id}`)}
          style={{ fontWeight: 700, color: '#6D28D9' }}
        >
          View Report
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Card style={{ borderRadius: 12, padding: 24 }}>
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (!patient) {
    return (
      <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
        <Empty description="Patient record not found in system." />
        <Button type="primary" onClick={() => navigate('/hospital/patients')} style={{ marginTop: 16, backgroundColor: '#6D28D9' }}>
          Back to Patients List
        </Button>
      </Card>
    );
  }

  const tabItems = [
    // 1. OVERVIEW
    {
      key: 'overview',
      label: (
        <span>
          <UserOutlined /> Overview
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Row gutter={[20, 20]}>
            {/* Vitals summary */}
            <Col xs={24} md={12}>
              <Card
                className="medx-card"
                title={<span style={{ fontWeight: 700, color: '#0F172A' }}>Latest Health Indicators</span>}
                style={{ borderRadius: 12, height: '100%' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>BLOOD PRESSURE</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{patient.vitals?.bloodPressure || '120/80'} mmHg</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>HEART RATE</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{patient.vitals?.heartRate || 72} bpm</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>SpO2 (OXYGEN)</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>{patient.vitals?.spO2 || 98}%</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>BLOOD GLUCOSE</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: patient.vitals?.glucose > 200 ? '#DC2626' : '#0F172A' }}>
                      {patient.vitals?.glucose || 110} mg/dL
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Current Care Coordination info */}
            <Col xs={24} md={12}>
              <Card
                className="medx-card"
                title={<span style={{ fontWeight: 700, color: '#0F172A' }}>Care Team & Case Status</span>}
                style={{ borderRadius: 12, height: '100%' }}
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<UserAddOutlined />}
                    onClick={() => setAssignModalOpen(true)}
                    style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}
                  >
                    Change Doctor
                  </Button>
                }
              >
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Assigned Doctor">
                    {patient.assignedDoctorId ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar src={patient.assignedDoctorId.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#6D28D9' }} />
                        <div>
                          <strong style={{ color: '#0F172A' }}>{patient.assignedDoctorId.name}</strong>
                          <div style={{ fontSize: 11, color: '#475569' }}>
                            {patient.assignedDoctorId.specialization} ({patient.assignedDoctorId.roomNumber || 'OPD'})
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Tag color="orange">Unassigned</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    {patient.departmentId?.name || 'General Medicine'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Alert Level">
                    <Tag color={patient.alertStatus === 'Critical' ? 'red' : patient.alertStatus === 'High' ? 'gold' : 'green'}>
                      {patient.alertStatus || 'None'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Latest Status">
                    {patient.latestReportSummary || 'Routine monitoring active.'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Active Health Alerts for this patient */}
          {alerts.length > 0 && (
            <Card
              className="medx-card"
              title={<span style={{ fontWeight: 700, color: '#DC2626' }}><AlertOutlined /> Active Critical Alerts</span>}
              style={{ borderRadius: 12, borderLeft: '4px solid #DC2626' }}
            >
              {alerts.map((al) => (
                <div
                  key={al._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: '1px solid #FEE2E2',
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: '#FFFBFB',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#991B1B' }}>
                      {al.parameter}: {al.value}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569' }}>
                      Range: {al.referenceRange} • Severity: <Tag color="red">{al.severity}</Tag>
                    </div>
                  </div>
                  <Tag color="volcano">{al.status}</Tag>
                </div>
              ))}
            </Card>
          )}
        </div>
      ),
    },

    // 2. MEDICAL HISTORY
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined /> Medical History
        </span>
      ),
      children: (
        <Card className="medx-card" style={{ borderRadius: 12 }}>
          <Descriptions title="Known Conditions & Background" bordered column={1} size="middle">
            <Descriptions.Item label="Primary Conditions">
              {patient.conditions && patient.conditions.length > 0 ? (
                patient.conditions.map((c, i) => (
                  <Tag color="purple" key={i} style={{ marginBottom: 4, backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                    {c}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">No medical conditions recorded.</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Known Allergies">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a, i) => (
                  <Tag color="red" key={i} style={{ marginBottom: 4, backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}>
                    {a}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">No known drug/food allergies.</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Family Medical History">
              {patient.familyHistory && patient.familyHistory.length > 0 ? (
                patient.familyHistory.map((f, i) => (
                  <Tag color="blue" key={i} style={{ marginBottom: 4, backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none' }}>
                    {f}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">No significant family history noted.</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Physician Notes">
              {patient.medicalNotes || <Text type="secondary">No medical history available.</Text>}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },

    // 3. REPORTS
    {
      key: 'reports',
      label: (
        <span>
          <FileTextOutlined /> Reports ({reports.length})
        </span>
      ),
      children: (
        <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
          <Table
            columns={reportColumns}
            dataSource={reports}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: 'No laboratory reports uploaded for this patient.' }}
          />
        </Card>
      ),
    },

    // 4. HEALTH TRENDS
    {
      key: 'trends',
      label: (
        <span>
          <LineChartOutlined /> Health Trends
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Blood Glucose Trend */}
          <Card
            className="medx-card"
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>Blood Glucose Trajectory (mg/dL)</span>}
            style={{ borderRadius: 12 }}
          >
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} domain={[60, 360]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fastingGlucose" name="Fasting Glucose" stroke="#6D28D9" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="postPrandial" name="Post-Prandial (2hr)" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Blood Pressure & Hemoglobin Trend */}
          <Card
            className="medx-card"
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>Blood Pressure & Hemoglobin Trend</span>}
            style={{ borderRadius: 12 }}
          >
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolicBP" name="Systolic BP (mmHg)" stroke="#7C3AED" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolicBP" name="Diastolic BP (mmHg)" stroke="#16A34A" strokeWidth={2} />
                  <Line type="monotone" dataKey="hemoglobin" name="Hemoglobin (g/dL)" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ),
    },

    // 5. APPOINTMENTS
    {
      key: 'appointments',
      label: (
        <span>
          <CalendarOutlined /> Appointments ({appointments.length})
        </span>
      ),
      children: (
        <Card className="medx-card" style={{ borderRadius: 12 }}>
          {appointments.length > 0 ? (
            <Table
              dataSource={appointments}
              rowKey="_id"
              pagination={false}
              columns={[
                {
                  title: 'Date & Time',
                  dataIndex: 'date',
                  key: 'date',
                  render: (d, record) => `${dayjs(d).format('DD MMM YYYY')} • ${record.timeSlot}`,
                },
                {
                  title: 'Attending Doctor',
                  dataIndex: 'doctorId',
                  key: 'doctor',
                  render: (doc) => doc?.name || 'Unassigned',
                },
                {
                  title: 'Consultation Type',
                  dataIndex: 'type',
                  key: 'type',
                  render: (t) => <Tag color="purple">{t}</Tag>,
                },
                {
                  title: 'Clinical Reason',
                  dataIndex: 'reason',
                  key: 'reason',
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (s) => (
                    <Tag color={s === 'Today' ? 'red' : s === 'Completed' ? 'green' : 'blue'}>
                      {s}
                    </Tag>
                  ),
                },
              ]}
            />
          ) : (
            <Empty description="No appointments on record for this patient." />
          )}
        </Card>
      ),
    },

    // 6. CARE TIMELINE
    {
      key: 'timeline',
      label: (
        <span>
          <HistoryOutlined /> Care Timeline
        </span>
      ),
      children: (
        <Card className="medx-card" style={{ borderRadius: 12, padding: '10px 20px' }}>
          <Timeline
            mode="left"
            items={careTimeline.map((item) => ({
              color: item.status === 'completed' ? '#16A34A' : item.status === 'in-progress' ? '#6D28D9' : '#94A3B8',
              label: <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{item.time}</span>,
              children: (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{item.description}</div>
                  <Tag
                    color={item.status === 'completed' ? 'green' : item.status === 'in-progress' ? 'purple' : 'default'}
                    style={{ marginTop: 6, fontSize: 11 }}
                  >
                    {item.status.toUpperCase()}
                  </Tag>
                </div>
              ),
            }))}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back Button & Patient Header Card */}
      <Card
        className="medx-card"
        style={{ borderRadius: 12, borderTop: '4px solid #6D28D9' }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/hospital/patients')}
              style={{ borderRadius: 8 }}
            />
            <Avatar
              size={56}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#6D28D9', fontSize: 24 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {patient.name}
                </span>
                <Tag style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                  ID: {patient.patientId}
                </Tag>
                <Tag color={patient.alertStatus === 'Critical' ? 'red' : 'green'} style={{ fontWeight: 600 }}>
                  Alert: {patient.alertStatus || 'None'}
                </Tag>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 13, color: '#475569', flexWrap: 'wrap' }}>
                <span>{patient.age} Years</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span>Blood Group: <strong style={{ color: '#6D28D9' }}>{patient.bloodGroup || 'O+'}</strong></span>
                <span>•</span>
                <span><PhoneOutlined /> {patient.contact}</span>
              </div>
            </div>
          </div>

          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setAssignModalOpen(true)}
              style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}
            >
              Assign Doctor
            </Button>
          </Space>
        </div>

        {/* Emergency Contact & Address Bar */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            gap: 24,
            fontSize: 12,
            color: '#475569',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ color: '#0F172A' }}>Emergency Contact:</strong> {patient.emergencyContact?.name} ({patient.emergencyContact?.relation}) — {patient.emergencyContact?.phone}
          </div>
          {patient.address && (
            <div>
              <strong style={{ color: '#0F172A' }}>Address:</strong> {patient.address.street}, {patient.address.city}
            </div>
          )}
        </div>
      </Card>

      {/* 6 Tabs for Patient Details */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={tabItems}
        style={{ marginTop: 4 }}
      />

      {/* Doctor Assignment Modal */}
      <DoctorAssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        patient={patient}
        onSuccess={() => fetchPatientDetails()}
      />
    </div>
  );
};

export default HospitalPatientDetails;
