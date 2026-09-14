import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Alert,
  message,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const user = await register(values);
      message.success(`Account created successfully! Welcome, ${user.name}.`);
      if (user.role === 'hospital_admin') navigate('/hospital');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
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
      <div style={{ width: '100%', maxWidth: 500 }}>
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
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
          }}
          bodyStyle={{ padding: '32px 28px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
              Create Med-X Account
            </Title>
            <Text style={{ fontSize: 13, color: '#475569' }}>
              Join the AI-Powered Healthcare Ecosystem
            </Text>
          </div>

          {errorMsg && (
            <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 18, borderRadius: 8 }} />
          )}

          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ role: 'hospital_admin' }}>
            <Form.Item
              name="name"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Full Name / Official Title</span>}
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder="Dr. Jane Smith" size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Email Address</span>}
              rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder="name@hospital.org" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Password</span>}
              rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="••••••••" size="large" />
            </Form.Item>

            <Form.Item
              name="role"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>System Role</span>}
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Option value="hospital_admin">Hospital Administrator (Hospital Module)</Option>
                <Option value="doctor">Medical Doctor / Physician</Option>
                <Option value="patient">Patient Account</Option>
                <Option value="lab_admin">Laboratory Partner Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Contact Phone</span>}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#94A3B8' }} />} placeholder="+91 98000 00000" size="large" />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', height: 44, fontWeight: 700, fontSize: 15 }}
              >
                Complete Registration
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#475569' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#6D28D9', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
