import React from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Tag,
  Space,
} from 'antd';
import {
  BankOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ExperimentOutlined,
  AlertOutlined,
  BarChartOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F6FA', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          height: 70,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Logo size="default" />

        <Space size={16}>
          {isAuthenticated ? (
            <>
              <Tag style={{ fontSize: 13, padding: '4px 10px', backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                Signed in as: <strong style={{ color: '#0F172A' }}>{user?.name}</strong> ({user?.role})
              </Tag>
              {user?.role === 'hospital_admin' && (
                <Button
                  type="primary"
                  onClick={() => navigate('/hospital')}
                  style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}
                >
                  Go to Hospital Dashboard
                </Button>
              )}
              {user?.role === 'doctor' && (
                <Button
                  type="primary"
                  onClick={() => navigate('/doctor')}
                  style={{ backgroundColor: '#7C3AED', borderColor: '#7C3AED', fontWeight: 600 }}
                >
                  Doctor Portal
                </Button>
              )}
              {user?.role === 'patient' && (
                <Button
                  type="primary"
                  onClick={() => navigate('/patient')}
                  style={{ backgroundColor: '#2563EB', borderColor: '#2563EB', fontWeight: 600 }}
                >
                  Patient Portal
                </Button>
              )}
              <Button onClick={() => logout()}>Logout</Button>
            </>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>Sign In</Button>
              <Button
                type="primary"
                onClick={() => navigate('/login')}
                style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}
              >
                Access Hospital Dashboard
              </Button>
            </>
          )}
        </Space>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #3B0764 50%, #6D28D9 100%)',
          color: '#FFFFFF',
          padding: '72px 24px 80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Tag
            style={{
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 700,
              marginBottom: 18,
              backgroundColor: '#F3EEFF',
              color: '#6D28D9',
              border: 'none',
            }}
          >
            MED-X HEALTHCARE ECOSYSTEM 2026
          </Tag>

          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#FFFFFF',
              lineHeight: 1.2,
              margin: '0 0 18px 0',
            }}
          >
            AI-Powered Clinical Care Coordination & Decision Support
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: '#E2E8F0',
              lineHeight: 1.6,
              maxWidth: 720,
              margin: '0 auto 32px auto',
            }}
          >
            Integrated hospital intelligence module connecting diagnostic labs, specialist physicians, critical alert triage, and patient care workflows.
          </p>

          <Space size={16} wrap>
            <Button
              type="primary"
              size="large"
              icon={<BankOutlined />}
              onClick={() => navigate('/hospital')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#6D28D9',
                fontWeight: 800,
                height: 48,
                padding: '0 28px',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            >
              Enter Hospital Admin Dashboard
            </Button>
            <Button
              size="large"
              ghost
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{ height: 48, padding: '0 24px', borderRadius: 8, fontWeight: 600, borderColor: '#FFFFFF', color: '#FFFFFF' }}
            >
              Sign In Portal
            </Button>
          </Space>
        </div>
      </section>

      {/* Main Ecosystem Portal Cards */}
      <main style={{ maxWidth: 1200, margin: '-40px auto 60px auto', padding: '0 24px', width: '100%' }}>
        <Row gutter={[24, 24]}>
          {/* Card 1: Hospital Admin Dashboard */}
          <Col xs={24} md={8}>
            <Card
              className="medx-card"
              hoverable
              onClick={() => navigate('/hospital')}
              style={{
                borderRadius: 16,
                borderTop: '6px solid #6D28D9',
                height: '100%',
                boxShadow: '0 12px 28px rgba(109, 40, 217, 0.1)',
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
              }}
              bodyStyle={{ padding: '28px 24px' }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: '#F3EEFF',
                  color: '#6D28D9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  marginBottom: 16,
                }}
              >
                <BankOutlined />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Hospital Admin Portal
                </span>
                <Tag style={{ backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE', fontWeight: 600 }}>CORE MODULE</Tag>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Centralized dashboard for patient care coordination, laboratory panels, real-time critical health alerts, doctor assignment, care queue, and institutional analytics.
              </p>
              <div style={{ marginTop: 20, color: '#6D28D9', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                Launch Hospital Module <ArrowRightOutlined />
              </div>
            </Card>
          </Col>

          {/* Card 2: Doctor Clinical Portal */}
          <Col xs={24} md={8}>
            <Card
              className="medx-card"
              hoverable
              onClick={() => navigate('/doctor')}
              style={{
                borderRadius: 16,
                borderTop: '6px solid #7C3AED',
                height: '100%',
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
              }}
              bodyStyle={{ padding: '28px 24px' }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  marginBottom: 16,
                }}
              >
                <MedicineBoxOutlined />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Doctor Clinical Interface
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Attending physician workstation for reviewing assigned patient cases, evaluating laboratory reports, conducting consultations, and signing clinical treatment notes.
              </p>
              <div style={{ marginTop: 20, color: '#7C3AED', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                Open Doctor Portal <ArrowRightOutlined />
              </div>
            </Card>
          </Col>

          {/* Card 3: Patient Care Portal */}
          <Col xs={24} md={8}>
            <Card
              className="medx-card"
              hoverable
              onClick={() => navigate('/patient')}
              style={{
                borderRadius: 16,
                borderTop: '6px solid #2563EB',
                height: '100%',
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
              }}
              bodyStyle={{ padding: '28px 24px' }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  marginBottom: 16,
                }}
              >
                <UserOutlined />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Patient Health Portal
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Patient-facing portal for viewing verified medical reports, tracking physiological vitals trends, managing consultation appointments, and physician communication.
              </p>
              <div style={{ marginTop: 20, color: '#2563EB', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                Open Patient Portal <ArrowRightOutlined />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Feature Highlights Grid */}
        <div style={{ marginTop: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Enterprise Clinical Capabilities
            </h2>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
              Built for high-reliability medical coordination with built-in clinical safety guidelines
            </p>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                <AlertOutlined style={{ fontSize: 28, color: '#DC2626', marginBottom: 12 }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Critical Health Alerts</h4>
                <p style={{ fontSize: 12, color: '#475569' }}>
                  Automated detection of physiological outliers with configurable laboratory reference range comparison.
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                <ExperimentOutlined style={{ fontSize: 28, color: '#6D28D9', marginBottom: 12 }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Non-Diagnostic AI Summaries</h4>
                <p style={{ fontSize: 12, color: '#475569' }}>
                  Decision support summaries with clear disclaimers that preserve physician clinical authority.
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                <MedicineBoxOutlined style={{ fontSize: 28, color: '#7C3AED', marginBottom: 12 }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Doctor Workload Triage</h4>
                <p style={{ fontSize: 12, color: '#475569' }}>
                  Dynamic doctor assignment workflows balanced by specialization, availability, and active patient queue.
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
                <BarChartOutlined style={{ fontSize: 28, color: '#16A34A', marginBottom: 12 }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Institutional Analytics</h4>
                <p style={{ fontSize: 12, color: '#475569' }}>
                  Visual metrics across patient visits, abnormal test frequency, department loads, and follow-up rates.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: '#0F172A',
          color: '#94A3B8',
          padding: '32px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', fontSize: 12, lineHeight: 1.6 }}>
          <strong style={{ color: '#FFFFFF' }}>Med-X – AI-Powered Healthcare Ecosystem</strong>
          <br />
          Medical Safety Notice: Med-X assists with patient prioritization, laboratory alerts, summaries, and care coordination. Final medical decisions remain strictly with qualified doctors.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
