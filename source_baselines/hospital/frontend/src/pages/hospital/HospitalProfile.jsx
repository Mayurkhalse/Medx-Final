import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Tag,
  Descriptions,
  Divider,
  Typography,
  Skeleton,
  message,
} from 'antd';
import {
  BankOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { hospitalApi } from '../../services/hospitalApi';

const { Title, Text } = Typography;

const HospitalProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [stats, setStats] = useState({ departmentsCount: 5, doctorsCount: 5 });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getProfile();
      if (res.success && res.hospital) {
        setHospital(res.hospital);
        if (res.stats) setStats(res.stats);
        form.setFieldsValue({
          name: res.hospital.name,
          phone: res.hospital.phone,
          email: res.hospital.email,
          emergencyContact: res.hospital.emergencyContact,
          operatingHours: res.hospital.operatingHours,
          street: res.hospital.address?.street,
          city: res.hospital.address?.city,
          state: res.hospital.address?.state,
          zip: res.hospital.address?.zip,
          country: res.hospital.address?.country || 'India',
        });
      }
    } catch (err) {
      message.error('Failed to load hospital profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        emergencyContact: values.emergencyContact,
        operatingHours: values.operatingHours,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip: values.zip,
          country: values.country,
        },
      };

      const res = await hospitalApi.updateProfile(payload);
      if (res.success) {
        message.success('Hospital administrative profile updated.');
        setHospital(res.hospital);
      }
    } catch (err) {
      message.error('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Hospital Institutional Profile & Settings
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Accreditation identifiers, operating hours, emergency lines, and facility capacity configurations.
          </Text>
        </div>
      </div>

      {loading ? (
        <Card style={{ borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {/* Left Column: Organization Summary Card */}
          <Col xs={24} lg={8}>
            <Card
              className="medx-card"
              style={{ borderRadius: 12, borderTop: '4px solid #6D28D9' }}
              bodyStyle={{ padding: '24px 20px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: '#F3EEFF',
                    color: '#6D28D9',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    marginBottom: 12,
                  }}
                >
                  <BankOutlined />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  {hospital?.name}
                </div>
                <Tag color="purple" style={{ marginTop: 6, fontWeight: 700, backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
                  ID: {hospital?.code || 'MEDX-HOSP-01'}
                </Tag>
              </div>

              <Divider style={{ margin: '14px 0' }} />

              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Accreditation License">
                  <span style={{ fontWeight: 700, color: '#6D28D9' }}>
                    <SafetyCertificateOutlined /> {hospital?.licenseNumber || 'MH-MEDX-HOSP-2026-8819'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Departments Active">
                  <strong>{stats.departmentsCount} Clinical Divisions</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Medical Staff">
                  <strong>{stats.doctorsCount} Certified Doctors</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Total Bed Capacity">
                  <strong>{hospital?.bedCapacity?.total || 350} Beds ({hospital?.bedCapacity?.icuAvailable || 14} ICU Free)</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Operating Mode">
                  <Tag color="green">24/7 Level 1 Emergency Active</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Right Column: Editable Settings Form */}
          <Col xs={24} lg={16}>
            <Card
              className="medx-card"
              style={{ borderRadius: 12 }}
              title={<span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Administrative Information & Contacts</span>}
            >
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="name" label="Hospital Registered Name" rules={[{ required: true }]}>
                      <Input placeholder="Enter hospital name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="Administrative Email" rules={[{ required: true, type: 'email' }]}>
                      <Input prefix={<MailOutlined />} placeholder="admin@hospital.org" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="phone" label="Main Hospital Desk Phone" rules={[{ required: true }]}>
                      <Input prefix={<PhoneOutlined />} placeholder="+91 22 2456 7890" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="emergencyContact"
                      label={<span style={{ color: '#DC2626', fontWeight: 700 }}><AlertOutlined /> 24/7 Emergency Line</span>}
                      rules={[{ required: true }]}
                    >
                      <Input prefix={<PhoneOutlined style={{ color: '#DC2626' }} />} placeholder="+91 22 2456 0911" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="operatingHours" label="Operating Hours & OPD Timings" rules={[{ required: true }]}>
                  <Input prefix={<ClockCircleOutlined />} placeholder="24/7 Emergency, OPD: 08:00 AM - 08:00 PM" size="large" />
                </Form.Item>

                <Divider style={{ margin: '14px 0' }}>Physical Location</Divider>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="street" label="Street Address">
                      <Input prefix={<EnvironmentOutlined />} placeholder="104 Healthcare Boulevard" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name="city" label="City">
                      <Input placeholder="Mumbai" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name="state" label="State">
                      <Input placeholder="Maharashtra" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="zip" label="ZIP / Postal Code">
                      <Input placeholder="400050" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="country" label="Country">
                      <Input placeholder="India" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 700 }}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default HospitalProfile;
