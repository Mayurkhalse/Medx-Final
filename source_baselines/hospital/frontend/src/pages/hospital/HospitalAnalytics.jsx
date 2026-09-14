import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Radio,
  Statistic,
  Typography,
  Space,
  Skeleton,
  Button,
  message,
} from 'antd';
import {
  ReloadOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { hospitalApi } from '../../services/hospitalApi';

const { Title, Text } = Typography;

const HospitalAnalytics = () => {
  const [range, setRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getAnalytics(range);
      if (res.success) {
        setAnalyticsData(res);
      }
    } catch (err) {
      message.error('Failed to load clinical analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const metrics = analyticsData?.metrics || {
    totalPatients: '1,248',
    newPatientsMonth: '184',
    patientVisits: '3,420',
    reportsProcessed: '892',
    abnormalReports: '146',
    criticalAlerts: '12',
    doctorConsultations: '1,180',
    followUpCompletionRate: '86.4%',
  };

  const charts = analyticsData?.charts || {};

  const pieColors = ['#16A34A', '#F59E0B', '#DC2626', '#6D28D9'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Timeframe Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Hospital Clinical Analytics & Intelligence
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Comprehensive institutional performance, diagnostic velocity, staff workload distribution, and patient outcome metrics.
          </Text>
        </div>

        <Space>
          <Radio.Group
            value={range}
            onChange={(e) => setRange(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="today">Today</Radio.Button>
            <Radio.Button value="7days">7 Days</Radio.Button>
            <Radio.Button value="30days">30 Days</Radio.Button>
            <Radio.Button value="3months">3 Months</Radio.Button>
          </Radio.Group>

          <Button icon={<ReloadOutlined />} onClick={fetchAnalytics} loading={loading} />
        </Space>
      </div>

      {/* 8 Analytics Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>TOTAL PATIENTS</span>}
              value={metrics.totalPatients}
              valueStyle={{ color: '#0F172A', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>NEW PATIENTS</span>}
              value={metrics.newPatientsMonth}
              valueStyle={{ color: '#16A34A', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>PATIENT VISITS</span>}
              value={metrics.patientVisits}
              valueStyle={{ color: '#2563EB', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>REPORTS PROCESSED</span>}
              value={metrics.reportsProcessed}
              valueStyle={{ color: '#6D28D9', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>ABNORMAL REPORTS</span>}
              value={metrics.abnormalReports}
              valueStyle={{ color: '#F59E0B', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>CRITICAL ALERTS</span>}
              value={metrics.criticalAlerts}
              valueStyle={{ color: '#DC2626', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>CONSULTATIONS</span>}
              value={metrics.doctorConsultations}
              valueStyle={{ color: '#7C3AED', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="medx-card" style={{ borderRadius: 10 }} bodyStyle={{ padding: 14 }}>
            <Statistic
              title={<span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>FOLLOW-UP RATE</span>}
              value={metrics.followUpCompletionRate}
              valueStyle={{ color: '#16A34A', fontWeight: 800, fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 6 Analytics Charts Grid */}
      <Row gutter={[20, 20]}>
        {/* Chart 1: Patient Visits Over Time */}
        <Col xs={24} lg={12}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>1. Patient Visits & Inpatient Inflow</span>}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.patientVisitsOverTime || []}>
                    <defs>
                      <linearGradient id="anVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="visits" name="Total Visits" stroke="#6D28D9" fill="url(#anVisits)" />
                    <Area type="monotone" dataKey="admissions" name="Admissions" stroke="#7C3AED" fill="#7C3AED" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Chart 2: Report Status Distribution */}
        <Col xs={24} lg={12}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>2. Report Status Distribution</span>}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.reportStatusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {(charts.reportStatusDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Chart 3: Alert Severity Distribution */}
        <Col xs={24} lg={12}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>3. Alert Severity Distribution</span>}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.alertSeverityDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Alert Count" radius={[6, 6, 0, 0]}>
                      {(charts.alertSeverityDistribution || []).map((entry, index) => {
                        const barColors = ['#DC2626', '#EA580C', '#F59E0B', '#16A34A'];
                        return <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Chart 4: Department Workload */}
        <Col xs={24} lg={12}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>4. Department Workload Breakdown</span>}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.departmentWorkload || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="patients" name="Patients" fill="#6D28D9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="consultations" name="Consultations" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Chart 5: Doctor Workload */}
        <Col xs={24} lg={12}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>5. Doctor Consultation & Review Workload</span>}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.doctorWorkload || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} width={90} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="patients" name="Patients Today" fill="#6D28D9" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="reviews" name="Pending Reviews" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Chart 6: Follow-up Completion */}
        <Col xs={24} lg={12}>
          <Card
            className="medx-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontWeight: 700, color: '#0F172A' }}>6. Patient Follow-up Pipeline Completion</span>}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.followUpCompletion || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="stage" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Completion %" fill="#16A34A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HospitalAnalytics;
