import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Typography,
  Skeleton,
  Divider,
  message,
} from 'antd';
import {
  MedicineBoxOutlined,
  FileTextOutlined,
  AlertOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { hospitalApi } from '../../services/hospitalApi';

const { Title, Text } = Typography;

const HospitalDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      message.error('Failed to load clinical departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const deptColors = ['#6D28D9', '#7C3AED', '#2563EB', '#16A34A', '#DC2626', '#F59E0B'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Hospital Clinical Departments
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Database-driven registry of specialized medical units, accredited staff counts, and department-level care metrics.
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchDepartments} loading={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Row gutter={[20, 20]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card style={{ borderRadius: 12 }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[20, 20]}>
          {departments.map((dept, idx) => {
            const themeColor = deptColors[idx % deptColors.length];
            return (
              <Col xs={24} md={12} lg={8} key={dept._id}>
                <Card
                  className="medx-card"
                  style={{
                    borderRadius: 12,
                    borderTop: `4px solid ${themeColor}`,
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '20px 22px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{dept.name}</div>
                      <Tag color="purple" style={{ marginTop: 4, fontWeight: 700, backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                        {dept.code}
                      </Tag>
                    </div>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        backgroundColor: '#F3EEFF',
                        color: themeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      <MedicineBoxOutlined />
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: '#475569', minHeight: 36 }}>
                    {dept.description || 'Specialized clinical assessment and management division.'}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <EnvironmentOutlined style={{ color: '#6D28D9' }} />
                    <span>{dept.floor || 'Floor 1, Main Wing'} • Head: <strong style={{ color: '#0F172A' }}>{dept.headDoctorName || 'Chief Consultant'}</strong></span>
                  </div>

                  <Divider style={{ margin: '14px 0' }} />

                  {/* Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>DOCTORS</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#6D28D9' }}>{dept.doctorsCount || 1}</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>PATIENTS</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{dept.patientsCount || 0}</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>APPOINTMENTS</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#16A34A' }}>{dept.appointmentsCount || 0}</div>
                    </div>
                  </div>

                  {/* Submetrics Row */}
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    <span>
                      <FileTextOutlined /> Pending Reports: <strong style={{ color: '#0F172A' }}>{dept.pendingReportsCount || 0}</strong>
                    </span>
                    <span style={{ color: '#DC2626', fontWeight: 700 }}>
                      <AlertOutlined /> Alerts: {dept.criticalAlertsCount || 0}
                    </span>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default HospitalDepartments;
