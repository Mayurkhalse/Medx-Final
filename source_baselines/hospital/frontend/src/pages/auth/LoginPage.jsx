import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Alert,
  message,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin } = useAuth();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectAfterLogin = (role) => {
    if (location.state?.from?.pathname) {
      navigate(location.state.from.pathname, { replace: true });
      return;
    }
    if (role === 'hospital_admin') {
      navigate('/hospital');
    } else if (role === 'doctor') {
      navigate('/doctor');
    } else if (role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/hospital');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const user = await login(values.email, values.password);
      message.success(`Welcome back, ${user.name}!`);
      redirectAfterLogin(user.role);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const user = await quickLogin(role);
      message.success(`Logged in as ${role === 'hospital_admin' ? 'Hospital Admin' : role === 'doctor' ? 'Doctor' : 'Patient'}!`);
      redirectAfterLogin(user.role);
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #3B0764 50%, #6D28D9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo Card */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Logo light={true} size="large" />
          </div>
        </div>

        <Card
          className="medx-card"
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.4)',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
          }}
          bodyStyle={{ padding: '32px 28px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
              Clinical Portal Sign In
            </Title>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Access the Med-X Healthcare Decision Support Ecosystem
            </Text>
          </div>

          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          {/* Quick Demo Switcher in Lavender (#F3EEFF) */}
          <div
            style={{
              backgroundColor: '#F3EEFF',
              border: '1px solid #DDD6FE',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
              ⚡ 1-Click Demo Login Selector
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <Button
                size="small"
                type="primary"
                icon={<BankOutlined />}
                onClick={() => handleQuickLogin('hospital_admin')}
                style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontSize: 11, fontWeight: 700, height: 32 }}
              >
                Hospital
              </Button>
              <Button
                size="small"
                icon={<MedicineBoxOutlined />}
                onClick={() => handleQuickLogin('doctor')}
                style={{ borderColor: '#7C3AED', color: '#7C3AED', backgroundColor: '#FFFFFF', fontSize: 11, fontWeight: 700, height: 32 }}
              >
                Doctor
              </Button>
              <Button
                size="small"
                icon={<UserOutlined />}
                onClick={() => handleQuickLogin('patient')}
                style={{ borderColor: '#2563EB', color: '#2563EB', backgroundColor: '#FFFFFF', fontSize: 11, fontWeight: 700, height: 32 }}
              >
                Patient
              </Button>
            </div>
          </div>

          <Divider style={{ margin: '16px 0', fontSize: 12, color: '#94A3B8' }}>
            or sign in with email
          </Divider>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              email: 'admin@medx.com',
              password: 'admin123',
            }}
          >
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Work Email Address</span>}
              rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
                placeholder="name@hospital.org"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Password</span>}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                placeholder="••••••••"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  backgroundColor: '#6D28D9',
                  borderColor: '#6D28D9',
                  height: 44,
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 8,
                }}
              >
                Sign In to Med-X
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#475569' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6D28D9', fontWeight: 700 }}>
              Register Portal Access
            </Link>
          </div>
        </Card>

        {/* Safety footer disclaimer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255, 255, 255, 0.7)' }}>
          Med-X Decision Support System • Enterprise Clinical Security
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
